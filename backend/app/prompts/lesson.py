from __future__ import annotations

import json
from typing import Optional, Dict, Any
from app.schemas.lesson import GenerateMaterialRequest


def chat_system_prompt() -> str:
    """
    System prompt used for lesson-material generation.

    Goals:
    - Adaptar o conteúdo para estudante autista (TEA) usando dados do aluno (student_profile).
    - Usar preferências (interesse/preferencia), dificuldades e nível de suporte do student_profile.
    - Fornecer roteiro curto, com falas prontas do professor.
    - Gerar exemplos e perguntas objetivas para checagem de compreensão.
    - Responder sempre em JSON válido (sem markdown).
    """
    return (
        "Você é uma IA pedagógica que adapta roteiros de aula para estudantes neurodivergentes com base em dados reais do aluno. "
        "Use APENAS as informações fornecidas em student_profile (não invente dados). "
        "Considere preferências/hiperfocos (interesse/preferencia), dificuldades, laudo, observações e nivel_de_suporte. "
        "Gere um roteiro com frases prontas para o professor falar (use o rótulo 'Professor: ...'), "
        "inclua analogias explicitamente usando o hiperfoco do aluno quando existir, e proponha atividade em passos curtos. "
        "Responda EM JSON COMPACTO com as chaves: "
        "recomendacoes (string), roteiro (string multiline), resumo (string), "
        "exemplos (array de 3 a 5 frases curtas), perguntas (array de 3 a 5 perguntas curtas). "
        "Nada de formatação markdown; apenas JSON válido. "
        "Se student_profile não trouxer preferencia/interesse, não invente hiperfoco."
    )


def build_llm_payload(
    req: GenerateMaterialRequest, student_profile: Optional[Dict[str, Any]] = None
) -> dict:
    """
    Builds the JSON payload sent to the LLM, optionally enriched with student profile from DB.
    """
    payload = {
        "disciplina": req.disciplina,
        "assunto": req.assunto,
        "descricao": req.descricao,
        "turma": req.turma,
        "data": req.data,
        "feedback": req.feedback,
        "student_profile": student_profile or None,
    }
    return payload


def build_user_message(
    req: GenerateMaterialRequest, student_profile: Optional[Dict[str, Any]] = None
) -> str:
    """
    Builds the user message with input payload encoded as JSON.
    """
    payload = build_llm_payload(req, student_profile)
    return "Gere material didático adaptado. Entrada (JSON): " + json.dumps(
        payload, ensure_ascii=False
    )


