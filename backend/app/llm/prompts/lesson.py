from __future__ import annotations

import json
from typing import Optional, Dict, Any
from app.schemas.lesson import GenerateMaterialRequest


def chat_system_prompt() -> str:
    """
    System prompt used for lesson-material generation (roteiro + resumo).

    Goals:
    - Objetivo: gerar um material que ajude o professor a conduzir uma aula atrativa e inclusiva, tornando-a mais atrativa para estudantes neurodivergentes por meio de EXEMPLOS/ANALOGIAS alinhados aos seus interesses/hiperfocos..
    - Aula inclusiva e normal para a turma inteira. O hiperfoco, quando existir, DEVE SEMPRE ser abordado em exemplos/analogias, sem dominar a aula.
    - Usar dados reais do aluno (student_profile) quando fornecido; não inventar informações.
    - Quando houver contexto de turma (turma_context com lista de alunos), considerar necessidades e interesses dos alunos ao planejar, sem expor dados sensíveis individualmente no texto final.
    - Papel: agir como professor experiente que fala para a turma; voz natural, acolhedora e envolvente; use perguntas retóricas e transições claras.
    - Saída estritamente em JSON, com duas chaves principais: roteiro e resumo. Não formatar como markdown.
    - Forma: evite listas rígidas; prefira uma fala coesa e natural (um script que o professor poderia dizer).
    """
    return (
        "Você é uma IA pedagógica que prepara uma aula inclusiva para toda a turma. "
        "Quando existir 'interesse' do student_profile, mencione esse interesse de forma explícita em 2 a 4 referências naturais (exemplos/analogias), mantendo a aula sobre o CONTEÚDO para a turma inteira. Evite estereótipos. "
        "mas não exponha dados pessoais sensíveis no texto; generalize como recomendações de mediação. "
        "Tom: professor acolhedor, envolvente, com linguagem clara. "
        "Produza APENAS JSON VÁLIDO (sem markdown) com o formato: "
        "{\"roteiro\": {\"topicos\": [strings OPCIONAL], \"falas\": [strings OU string], \"exemplos\": [strings OPCIONAL]}, "
        "\"resumo\": {\"texto\": string, \"exemplo\": string}}. "
        "A chave 'falas' pode ser UMA fala longa (um script coeso), evitando listas rígidas de passos. "
        "Se houver vários interesses na 'turma_context', escolha 1-3 interesses mais representativos e ALTERNE os exemplos ao longo da fala. "
        "Resumo: escreva um parágrafo consistente (≈150–220 palavras) para estudo em casa; recapitule ideia central, termos-chave (mencione 3-5 no texto), relações entre conceitos, relevância prática, um mini-exercício de autoexplicação e uma dica de retenção. "
        "Se não houver dados de interesse/preferência, os exemplos devem ser gerais e do cotidiano. "
        "Se houver, inclua ao menos 1 exemplo alinhado ao Interesse do publico neurodivergente e o restante gerais. "
        "Use apenas informações do student_profile quando fornecido; não invente. "
        "Nada de markdown, títulos ou explicações fora do JSON."
    )


def build_llm_payload(
    req: GenerateMaterialRequest,
    student_profile: Optional[Dict[str, Any]] = None,
    turma_context: Optional[Dict[str, Any]] = None,
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
        "turma_context": turma_context or None,
    }
    return payload


def build_user_message(
    req: GenerateMaterialRequest,
    student_profile: Optional[Dict[str, Any]] = None,
    turma_context: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Builds a detailed user message that instructs the LLM to use both teacher inputs
    and DB context (student_profile and turma_context) while keeping the output strict JSON.
    """
    payload = build_llm_payload(req, student_profile, turma_context)
    parts: list[str] = []
    parts.append("Tarefa: Gere um material de aula convencional e inclusivo, com um roteiro falado que o professor pode usar em sala e um resumo para estudo em casa.")
    parts.append("Integre hiperfocos de forma NATURAL (2-4 referências) como exemplos/analogias, sem transformar a aula no tema do hiperfoco.")
    parts.append(
        (
            "Personalização obrigatória: "
            "1) Reflita o assunto e a descrição fornecidos; "
            "2) Ajuste linguagem e mediação considerando 'nivel_de_suporte' do aluno quando existir; "
            "3) Se houver 'turma_context', consolide interesses distintos (sem citar nomes) e alterne exemplos; "
            "4) Não invente dados; só use o que está em 'student_profile' e 'turma_context'; "
            "5) Não exponha dados sensíveis individuais no texto final (generalize recomendações)."
        )
    )
    parts.append(
        (
            "Formato de saída (JSON VÁLIDO, sem markdown, sem comentários): "
            "{\"roteiro\": {\"topicos\": [strings OPCIONAL], \"falas\": [strings OU string], \"exemplos\": [strings OPCIONAL]}, "
            "\"resumo\": {\"texto\": string, \"exemplo\": string}}"
        )
    )
    parts.append(
        (
            "Limites: roteiro em fala coesa (ou 6-12 falas curtas); 0-4 tópicos; 3-5 exemplos. "
            "Português do Brasil; linguagem clara, acolhedora e envolvente."
        )
    )
    parts.append("IMPORTANTE: personalize de forma concreta ao ASSUNTO/DESCRIÇÃO; se 'student_profile.interesse' existir, inclua 2 referências alinhadas e os demais exemplos gerais/cotidianos.")
    parts.append("Entrada (JSON de referência para geração): " + json.dumps(payload, ensure_ascii=False, default=str))
    return "\n".join(parts)



