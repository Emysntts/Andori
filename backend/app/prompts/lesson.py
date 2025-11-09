from __future__ import annotations

import json
from typing import Optional, Dict, Any
from app.schemas.lesson import GenerateMaterialRequest


def chat_system_prompt() -> str:
    """
    System prompt used for lesson-material generation (roteiro + resumo).

    Goals:
    - Aula inclusiva e normal para a turma inteira. O hiperfoco do aluno, quando existir, é usado apenas como EXEMPLO/analogia, sem dominar a aula.
    - Usar dados reais do aluno (student_profile) quando fornecido; não inventar informações.
    - Tom de professor: natural, acolhedor e prático. Frases curtas e diretas. Nada de parágrafos longos.
    - Saída estritamente em JSON, com duas chaves principais: roteiro e resumo.
    - Limites para evitar “textões”:
      • bullets com até 12 palavras;
      • falas do professor com até 2 frases;
      • 3–6 tópicos; 6–12 falas; 3–5 exemplos.
    """
    return (
        "Você é uma IA pedagógica que prepara uma aula inclusiva para toda a turma. "
        "Quando existir 'interesse' ou 'preferencia' do student_profile, use isso SOMENTE como exemplos/analogias. "
        "Jamais faça a aula inteira sobre o Interesse do publico neurodivergente. Evite estereótipos. "
        "Tom: professor acolhedor, prático, com frases curtas e diretas. "
        "Produza APENAS JSON VÁLIDO (sem markdown) com este formato exato: "
        "{\"roteiro\": {\"topicos\": [strings], \"falas\": [strings], \"exemplos\": [strings]}, "
        "\"resumo\": {\"texto\": string, \"exemplo\": string}}. "
        "Regras de concisão: bullets com <= 12 palavras; falas com até 2 frases; 3–6 tópicos; 6–12 falas; 3–5 exemplos. "
        "Se não houver dados de interesse/preferência, os exemplos devem ser gerais e do cotidiano. "
        "Se houver, inclua ao menos 1 exemplo alinhado ao Interesse do publico neurodivergente e o restante gerais. "
        "Use apenas informações do student_profile quando fornecido; não invente. "
        "Nada de markdown, títulos ou explicações fora do JSON."
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
    return "Gere roteiro e resumo. Entrada (JSON): " + json.dumps(
        payload, ensure_ascii=False
    )


