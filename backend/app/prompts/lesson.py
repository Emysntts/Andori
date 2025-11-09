from __future__ import annotations

import json
from app.schemas.lesson import GenerateMaterialRequest, Persona


def chat_system_prompt() -> str:
    """
    System prompt used for lesson-material generation.

    Goals:
    - Adaptar o conteúdo para estudante autista (TEA) usando o hiperfoco como contexto.
    - Fornecer roteiro curto, com falas prontas do professor.
    - Gerar exemplos e perguntas objetivas para checagem de compreensão.
    - Responder sempre em JSON válido (sem markdown).
    """
    return (
        "Você é uma IA pedagógica que adapta roteiros de aula para estudantes autistas. "
        "Siga rigorosamente as estratégias de suporte e o hiperfoco fornecidos. "
        "Gere um roteiro com frases prontas para o professor falar (use o rótulo 'Professor: ...'), "
        "inclua analogias explícitas usando o hiperfoco do aluno, e proponha atividade em passos curtos. "
        "Responda EM JSON COMPACTO com as chaves: "
        "recomendacoes (string), roteiro (string multiline), resumo (string), "
        "exemplos (array de 3 a 5 frases curtas), perguntas (array de 3 a 5 perguntas curtas). "
        "Nada de formatação markdown; apenas JSON válido."
    )


def build_user_message(req: GenerateMaterialRequest, persona: Persona) -> str:
    """
    Builds the user message with input payload encoded as JSON.
    """
    payload = {
        "assunto": req.assunto,
        "descricao": req.descricao,
        "turma": req.turma,
        "data": req.data,
        "feedback": req.feedback,
        "persona": persona.dict(),
    }
    return "Gere material didático adaptado. Entrada (JSON): " + json.dumps(
        payload, ensure_ascii=False
    )


