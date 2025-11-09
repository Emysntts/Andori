from __future__ import annotations

import json
from typing import Optional, Dict, Any

import httpx
from sqlalchemy import text
from sqlalchemy.engine import Row
from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.lesson import Material, GenerateMaterialRequest
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
            "Estruturar tarefas em micro‑etapas (2‑3 minutos)",
            "Oferecer comunicação alternativa (quadros/PECS) se necessário",
        ]
    if n == "medio" or n == "médio":
        return base + ["Relembrar combinações e usar pistas visuais frequentes"]
    return base


def build_persona_from_profile(subject: str, explicit_hyperfocus: Optional[str], student_profile: Optional[Dict[str, Any]]) -> Persona:
    if student_profile:
        hyperfocus = explicit_hyperfocus or student_profile.get("interesse") or student_profile.get("preferencia") or _choose_hyperfocus(subject)
        supports = _supports_from_level(student_profile.get("nivel_de_suporte"))
        return Persona(
            label="Estudante autista (TEA) com hiperfoco",
            description="Comunicação clara e concreta, rotina previsível, pistas visuais, tempo para processamento e estratégias de regulação sensorial.",
            hyperfocus=hyperfocus,
            supports=supports,
        )
    raise NotImplementedError


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


def local_generate(req: GenerateMaterialRequest, student_profile: Optional[Dict[str, Any]] = None) -> Material:
    hyperfocus = _select_hyperfocus(student_profile, req.hyperfocus)
    header = f"{req.assunto} — {req.turma or 'turma'} ({req.data or 'sem data'})"
    improve = f" Ajustes pedidos: {req.feedback}." if req.feedback else ""
    supports_list = _supports_from_level(student_profile.get("nivel_de_suporte") if student_profile else None)
    supports_str = "\n".join(f"- {s}" for s in supports_list)
    if hyperfocus:
        supports_str += f"\n- Ao possível, usar analogias e exemplos com o hiperfoco em {hyperfocus}."
    recomendacoes = f"Checklist de suporte:\n{supports_str}{improve}"
    roteiro = "\n".join(
        [
            f"1) Abertura ({header})",
            (
                f'Professor: "Hoje vamos estudar {req.assunto} usando {hyperfocus} como nosso mundo de exemplos."'
                if hyperfocus
                else f'Professor: "Hoje vamos estudar {req.assunto}. Vou apresentar em passos curtos e claros."'
            ),
            "Mostre a agenda visual (3 a 5 etapas).",
            "",
            "2) Conexão com o hiperfoco",
            (
                f'Professor: "Se {req.assunto} fosse um exemplo em {hyperfocus}, que partes precisaríamos combinar?"'
                if hyperfocus
                else 'Professor: "Vamos relacionar o conteúdo com um exemplo do cotidiano. Que partes precisamos combinar?"'
            ),
            "",
            "3) Mini‑exposição com analogias",
            "Fale frases curtas e mostre 1 imagem/diagrama. Evite parágrafos longos.",
            'Professor: "Passo 1..., Passo 2..., Passo 3..."',
            "",
            "4) Atividade guiada (passos curtos)",
            "Instrua em etapas numeradas e visíveis:",
            "- Passo 1: (ex.: listar conceitos de bloco).",
            "- Passo 2: (ex.: ligar conceitos como se fossem crafting).",
            f"- Passo 3: (ex.: montar a estrutura final que explica {req.assunto}).",
            "Ofereça opção de registro: quadro, caderno, cartões ou esquema que lembre crafting.",
            "",
            "5) Checagem de compreensão",
            'Pergunte: "Qual parte foi mais difícil? O que falta para completar?"',
            (
                f'Professor: "Explique usando um exemplo de {hyperfocus}."'
                if hyperfocus
                else 'Professor: "Explique com um exemplo simples do seu cotidiano."'
            ),
            "",
            "6) Fechamento e tarefa",
            (
                f"Checklist do que aprendemos. Tarefa curta: escrever/desenhar um exemplo de {req.assunto} usando {hyperfocus}."
                if hyperfocus
                else f"Checklist do que aprendemos. Tarefa curta: escrever/desenhar um exemplo simples de {req.assunto}."
            ),
        ]
    )
    resumo = (
        f"Ao final, os estudantes explicam os pontos‑chave de \"{req.assunto}\" e "
        + (
            f"relacionam com {hyperfocus}. "
            if hyperfocus
            else ""
        )
        + "Use um mapa mental simples com 3‑5 palavras‑chave. "
        + (f'Baseie a mediação nesta descrição: "{req.descricao}".' if req.descricao else "")
    )
    exemplos = (
        [
            f"Usar analogias com {hyperfocus} para explicar {req.assunto}.",
            f"Comparar {req.assunto} a montar uma estrutura conhecida em {hyperfocus}.",
            f"Criar um desafio em que cada conceito de {req.assunto} se relaciona a um elemento de {hyperfocus}."
        ] if hyperfocus else [
            f"Usar um exemplo cotidiano curto para explicar {req.assunto}.",
            f"Comparar {req.assunto} a uma receita simples passo a passo.",
            f"Criar um desafio com 3 etapas que conecta os conceitos de {req.assunto}."
        ]
    )
    perguntas = (
        [
            f"Se {req.assunto} fosse um exemplo em {hyperfocus}, que parte faltaria para ficar completo? Por quê?",
            f"Qual parte de {req.assunto} você relaciona primeiro com {hyperfocus}? E depois?",
            f"Explique {req.assunto} usando um exemplo de {hyperfocus} que você já conhece."
        ] if hyperfocus else [
            f"Qual parte de {req.assunto} foi mais clara? Qual precisa de revisão?",
            f"Liste 3 passos para explicar {req.assunto} a um colega.",
            f"Dê um exemplo simples do cotidiano que ajude a entender {req.assunto}."
        ]
    )

    return Material(
        recomendacoes=recomendacoes,
        roteiro=roteiro,
        resumo=resumo,
        exemplos=exemplos,
        perguntas=perguntas,
    )


async def openai_generate(req: GenerateMaterialRequest, student_profile: Optional[Dict[str, Any]] = None) -> Optional[Material]:
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
        parsed = json.loads(content)
        if not all(k in parsed for k in ("recomendacoes", "roteiro", "resumo")):
            return None
        return Material(
            persona=persona,
            recomendacoes=parsed["recomendacoes"],
            roteiro=parsed["roteiro"],
            resumo=parsed["resumo"],
            exemplos=parsed.get("exemplos"),
            perguntas=parsed.get("perguntas"),
        )
    except Exception:
        return None


