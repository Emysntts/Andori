from __future__ import annotations

import json
from typing import Optional, Dict, Any

import httpx
from sqlalchemy import text
from sqlalchemy.engine import Row
from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.lesson import GenerateMaterialRequest, Roteiro, Resumo
from app.prompts import chat_system_prompt, build_user_message


def _select_hyperfocus(student_profile: Optional[Dict[str, Any]], explicit_hyperfocus: Optional[str]) -> Optional[str]:
    if explicit_hyperfocus:
        return explicit_hyperfocus
    if not student_profile:
        return None
    return student_profile.get("interesse") or student_profile.get("preferencia")


def _supports_from_level(nivel_de_suporte: Optional[str]) -> list[str]:
    base = [
        "Antecipação da agenda e objetivos",
        "Instruções passo a passo com exemplos visuais",
        "Linguagem direta, sem ambiguidades",
        "Tempo extra para resposta e pausas curtas",
        "Opções de participação com baixa sobrecarga sensorial",
    ]
    n = (nivel_de_suporte or "").strip().lower()
    if n == "alto":
        return base + [
            "Modelagem de respostas com scripts visuais",
            "Estruturar tarefas em micro etapas (2 a 3 minutos)",
            "Oferecer comunicação alternativa (quadros/PECS) se necessário",
        ]
    if n == "medio" or n == "médio":
        return base + ["Relembrar combinações e usar pistas visuais frequentes"]
    return base


def fetch_student_profile(db: Optional[Session], aluno_id: Optional[str]) -> Optional[Dict[str, Any]]:
    if db is None or not aluno_id:
        return None
    row: Optional[Row] = db.execute(
        text(
            """
            SELECT a.id,
                   a.nome,
                   a.interesse,
                   a.preferencia,
                   a.dificuldade,
                   a.laudo,
                   a.observacoes,
                   a.recomendacoes,
                   a.nivel_de_suporte,
                   a.descricao_do_aluno,
                   a.turma_id,
                   t.nome AS turma_nome
            FROM public.alunos a
            LEFT JOIN public.turmas t ON t.id = a.turma_id
            WHERE a.id = :aluno_id
            """
        ),
        {"aluno_id": aluno_id},
    ).mappings().first()
    if not row:
        return None
    return {
        "id": row.get("id"),
        "nome": row.get("nome"),
        "interesse": row.get("interesse"),
        "preferencia": row.get("preferencia"),
        "dificuldade": row.get("dificuldade"),
        "laudo": row.get("laudo"),
        "observacoes": row.get("observacoes"),
        "recomendacoes": row.get("recomendacoes"),
        "nivel_de_suporte": row.get("nivel_de_suporte"),
        "descricao_do_aluno": row.get("descricao_do_aluno"),
        "turma_id": row.get("turma_id"),
        "turma_nome": row.get("turma_nome"),
    }


def local_generate(req: GenerateMaterialRequest, student_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    hyperfocus = _select_hyperfocus(student_profile, req.hyperfocus)
    topicos = [
        f"Apresentar objetivo de {req.assunto}",
        "Relembrar conhecimento prévio",
        "Explicar conceito-chave 1",
        "Explicar conceito-chave 2",
        "Prática guiada curta",
        "Checagem rápida e fechamento",
    ]
    falas = [
        f"Hoje vamos estudar {req.assunto} em passos curtos.",
        "Olhe a agenda no quadro. Vamos avançar juntos.",
        "Primeiro, recupere um exemplo do dia a dia.",
        "Agora, veja como as ideias se conectam.",
        "Vamos praticar com uma tarefa rápida.",
        "O que ficou menos claro? Eu repito se precisar.",
        "Fechando: resuma em uma frase o que aprendeu.",
    ]
    exemplos = (
        [
            f"Exemplo alinhado ao Interesse do publico neurodivergente ({hyperfocus}) para ilustrar {req.assunto}.",
            f"Comparar {req.assunto} a uma mecânica relacionada ao Interesse do publico neurodivergente ({hyperfocus}).",
            "Exemplo cotidiano simples aplicando o conceito.",
        ]
        if hyperfocus
        else [
            "Exemplo cotidiano simples 1.",
            "Exemplo cotidiano simples 2.",
            "Analogia curta com objeto comum.",
        ]
    )
    roteiro = Roteiro(topicos=topicos[:6], falas=falas[:7], exemplos=exemplos[:5])
    resumo_texto = (
        f"Revisamos os pontos básicos de {req.assunto} com passos curtos e prática guiada."
    )
    resumo_exemplo = (
        f"Exemplo alinhado ao Interesse do publico neurodivergente ({hyperfocus}) para conectar ideias."
        if hyperfocus
        else "Exemplo do cotidiano para fixar o conceito."
    )
    resumo = Resumo(texto=resumo_texto, exemplo=resumo_exemplo)
    return {"roteiro": roteiro, "resumo": resumo}


async def openai_generate(req: GenerateMaterialRequest, student_profile: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    if not settings.openai_api_key:
        return None

    system = chat_system_prompt()

    user_message = build_user_message(req, student_profile)

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.openai_model,
                    "temperature": settings.openai_temperature,
                    "response_format": {"type": "json_object"},
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user_message},
                    ],
                },
            )
        r.raise_for_status()
        data = r.json()
        content = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "{}")
        )
        parsed = json.loads(content)  # expecting {"roteiro": {...}, "resumo": {...}}
        if not all(k in parsed for k in ("roteiro", "resumo")):
            return None
        roteiro_obj = parsed["roteiro"] or {}
        resumo_obj = parsed["resumo"] or {}
        roteiro = Roteiro(
            topicos=roteiro_obj.get("topicos", []),
            falas=roteiro_obj.get("falas", []),
            exemplos=roteiro_obj.get("exemplos", []),
        )
        resumo = Resumo(
            texto=resumo_obj.get("texto", ""),
            exemplo=resumo_obj.get("exemplo", ""),
        )
        return {"roteiro": roteiro, "resumo": resumo}
    except Exception:
        return None


