from __future__ import annotations

import json
from typing import Optional, Dict, Any, List
import re

import httpx
from sqlalchemy import text
from sqlalchemy.engine import Row
from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.lesson import GenerateMaterialRequest, Roteiro, Resumo
from app.llm.prompts import chat_system_prompt, build_user_message


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
        "nivel_de_suporte": row.get("nivel_de_suporte"),
        "descricao_do_aluno": row.get("descricao_do_aluno"),
        "turma_id": row.get("turma_id"),
        "turma_nome": row.get("turma_nome"),
    }


def fetch_turma_context(db: Optional[Session], turma_id: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Retorna contexto da turma e perfis básicos dos alunos desta turma.
    """
    if db is None or not turma_id:
        return None
    turma_row: Optional[Row] = db.execute(
        text(
            """
            SELECT t.id, t.nome
            FROM public.turmas t
            WHERE t.id = :id
            """
        ),
        {"id": turma_id},
    ).mappings().first()
    if not turma_row:
        return None
    alunos_rows = db.execute(
        text(
            """
            SELECT a.id,
                   a.nome,
                   a.interesse,
                   a.preferencia,
                   a.dificuldade,
                   a.laudo,
                   a.observacoes,
                   a.nivel_de_suporte,
                   a.descricao_do_aluno
            FROM public.alunos a
            WHERE a.turma_id = :turma_id
            ORDER BY a.nome
            """
        ),
        {"turma_id": turma_id},
    ).mappings().all()
    alunos: List[Dict[str, Any]] = [
        {
            "id": r.get("id"),
            "nome": r.get("nome"),
            "interesse": r.get("interesse"),
            "preferencia": r.get("preferencia"),
            "dificuldade": r.get("dificuldade"),
            "laudo": r.get("laudo"),
            "observacoes": r.get("observacoes"),
            "nivel_de_suporte": r.get("nivel_de_suporte"),
            "descricao_do_aluno": r.get("descricao_do_aluno"),
        }
        for r in alunos_rows
    ]
    return {"turma_id": turma_row.get("id"), "turma_nome": turma_row.get("nome"), "alunos": alunos}


def _extract_ano_from_text(turma_text: str) -> Optional[str]:
    """
    Extrai o 'ano' escolar do texto da turma. Ex.: '4º ano A' -> '4º ano'
    """
    if not turma_text:
        return None
    s = turma_text.lower().strip()
    match = re.search(r"(\d+)\s*(?:º|o)?\s*ano", s)
    if match:
        return f"{match.group(1)}º ano"
    num = re.search(r"\d+", s)
    if num:
        return f"{num.group(1)}º ano"
    return None


def fetch_turma_context_by_name_or_year(db: Optional[Session], turma_text: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Busca contexto de turma usando o nome livre informado ou o ano escolar extraído do texto.
    Consolida os alunos de todas as turmas compatíveis.
    """
    if db is None or not turma_text:
        return None
    ano = _extract_ano_from_text(turma_text)
    num_match = re.search(r"\d+", turma_text)
    num = num_match.group(0) if num_match else None
    turmas_rows = db.execute(
        text(
            """
            SELECT t.id, t.nome
            FROM public.turmas t
            WHERE lower(t.nome) = :nome_exact
               OR t.nome ILIKE :nome_like
               {ano_filter}
               {num_filter}
            ORDER BY t.nome
            """.format(
                ano_filter="OR t.nome ILIKE :ano_like" if ano else "",
                num_filter="OR regexp_replace(lower(t.nome), '[^0-9]', '', 'g') = :num" if num else "",
            )
        ),
        {
            "nome_exact": turma_text.lower(),
            "nome_like": f"%{turma_text}%",
            **({"ano_like": f"%{ano}%"} if ano else {}),
            **({"num": num} if num else {}),
        },
    ).mappings().all()
    if not turmas_rows:
        return None
    turma_ids = [r.get("id") for r in turmas_rows if r.get("id")]
    alunos_rows = db.execute(
        text(
            """
            SELECT a.id,
                   a.nome,
                   a.interesse,
                   a.preferencia,
                   a.dificuldade,
                   a.laudo,
                   a.observacoes,
                   a.nivel_de_suporte,
                   a.descricao_do_aluno
            FROM public.alunos a
            WHERE a.turma_id = ANY(:ids)
            ORDER BY a.nome
            """
        ),
        {"ids": turma_ids},
    ).mappings().all()
    alunos: List[Dict[str, Any]] = [
        {
            "id": r.get("id"),
            "nome": r.get("nome"),
            "interesse": r.get("interesse"),
            "preferencia": r.get("preferencia"),
            "dificuldade": r.get("dificuldade"),
            "laudo": r.get("laudo"),
            "observacoes": r.get("observacoes"),
            "nivel_de_suporte": r.get("nivel_de_suporte"),
            "descricao_do_aluno": r.get("descricao_do_aluno"),
        }
        for r in alunos_rows
    ]
    nomes = [r.get("nome") for r in turmas_rows if r.get("nome")]
    return {"turma_id": None, "turma_nome": ", ".join(nomes), "alunos": alunos}

def local_generate(req: GenerateMaterialRequest, student_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Geração local mais imersiva e personalizada quando a LLM estiver indisponível.
    Usa assunto/descrição do professor, hiperfoco (do aluno ou explícito) e nível de suporte.
    """
    hyperfocus = _select_hyperfocus(student_profile, req.hyperfocus)
    nivel = (student_profile or {}).get("nivel_de_suporte")
    supports = _supports_from_level(nivel)
    aluno_nome = (student_profile or {}).get("nome")

    assunto = (req.assunto or "conteúdo").strip()
    descricao = (req.descricao or "").strip()

    topicos: list[str] = []
    saudacao = "Vamos avançar juntos." if not aluno_nome else f"Vamos avançar juntos, {aluno_nome} e turma."
    intro = f"Hoje vamos estudar {assunto}. {saudacao}"
    ctx = f"{' ' + descricao if descricao else ''}"
    if hyperfocus:
        hf_1 = f"Pense no universo de {hyperfocus}: como ele nos ajuda a enxergar {assunto}?"
        hf_2 = f"Se {assunto} fosse uma missão em {hyperfocus}, quais seriam os passos e recursos para concluir?"
        hf_3 = f"Vamos criar uma analogia com {hyperfocus} para tornar {assunto} concreto e divertido."
    else:
        hf_1 = f"Pense em algo do seu dia a dia que ajude a enxergar {assunto}."
        hf_2 = f"Se {assunto} fosse uma tarefa cotidiana, quais seriam os passos e recursos?"
        hf_3 = f"Vamos criar uma analogia simples para tornar {assunto} concreto."

    suporte = " ".join([f"{tip}." for tip in supports[:2]])
    narrativa = (
        f"{intro}{ctx} {hf_1} {hf_2} {hf_3} "
        f"Perceba como as ideias de {assunto} ganham forma quando conectamos com experiências reais. "
        f"{suporte} "
        f"Enquanto exploramos, compare com algo que você já viu e ajuste a explicação ao seu jeito."
    )
    script = narrativa.strip()
    falas: list[str] = [script]

    if hyperfocus:
        exemplos = [
            f"Use {hyperfocus} para criar uma metáfora concreta que explique {assunto}.",
            f"Construa um passo a passo visual relacionando {assunto} a ações em {hyperfocus}.",
            f"Exemplo simples do cotidiano que tenha a mesma lógica de {assunto}.",
        ]
    else:
        exemplos = [
            f"Exemplo prático do cotidiano aplicando {assunto}.",
            f"Comparação curta entre {assunto} e uma tarefa diária.",
            f"Diagrama simples com 3 passos que explicam {assunto}.",
        ]

    roteiro = Roteiro(topicos=topicos, falas=falas, exemplos=exemplos)
    resumo_texto = (
        f"{assunto}: neste estudo, você viu a ideia central, por que ela é importante e como reconhecê‑la no dia a dia. "
        f"Revimos termos essenciais e como se conectam entre si, com exemplos claros e uma analogia para facilitar a visualização. "
        f"Para fixar, tente explicar o conceito com suas próprias palavras e crie um exemplo novo que siga a mesma lógica. "
        f"Se ficar difícil, retome as partes menores primeiro (definições e relações) e junte novamente. "
        f"Dica para estudar em casa: monte um mini mapa com 3–5 palavras‑chave e escreva uma aplicação prática do conteúdo."
    )
    resumo_exemplo = (
        f"Uma analogia com {hyperfocus} para fixar a ideia central."
        if hyperfocus
        else "Uma analogia cotidiana para fixar a ideia central."
    )
    resumo = Resumo(texto=resumo_texto, exemplo=resumo_exemplo)
    return {"roteiro": roteiro, "resumo": resumo}


async def openai_generate(
    req: GenerateMaterialRequest,
    student_profile: Optional[Dict[str, Any]] = None,
    turma_context: Optional[Dict[str, Any]] = None,
) -> Optional[Dict[str, Any]]:
    if not settings.openai_api_key:
        return None

    system = chat_system_prompt()

    user_message = build_user_message(req, student_profile, turma_context)

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
        if not all(k in parsed for k in ("roteiro", "resumo")):
            return None
        roteiro_obj = parsed["roteiro"] or {}
        resumo_obj = parsed["resumo"] or {}
        def _ensure_list(value) -> list[str]:
            if value is None:
                return []
            if isinstance(value, list):
                return [str(v) for v in value]
            return [str(value)]
        roteiro = Roteiro(
            topicos=_ensure_list(roteiro_obj.get("topicos")),
            falas=_ensure_list(roteiro_obj.get("falas")),
            exemplos=_ensure_list(roteiro_obj.get("exemplos")),
        )
        resumo = Resumo(
            texto=resumo_obj.get("texto", ""),
            exemplo=resumo_obj.get("exemplo", ""),
        )
        return {"roteiro": roteiro, "resumo": resumo}
    except Exception:
        return None


