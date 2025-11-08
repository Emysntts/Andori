from __future__ import annotations

import json
from typing import Optional

import httpx

from app.core.config import settings
from app.schemas.lesson import Persona, Material, GenerateMaterialRequest


def _choose_hyperfocus(subject: str) -> str:
    s = (subject or "").lower()
    if "geograf" in s:
        return "mapas e lugares do mundo"
    if "hist" in s:
        return "antiguidade e impérios"
    if "ciên" in s or "cien" in s:
        return "astronomia"
    if "portugu" in s or "língua" in s:
        return "tipos de texto"
    if "mat" in s:
        return "números e padrões"
    if "biolog" in s:
        return "dinossauros"
    return "trens e sistemas de transporte"


def minecraft_persona() -> Persona:
    return Persona(
        label="Estudante autista (TEA) com hiperfoco",
        description=(
            "Comunicação clara e concreta, rotina previsível, pistas visuais, "
            "tempo para processamento e estratégias de regulação sensorial."
        ),
        hyperfocus="Minecraft",
        supports=[
            "Antecipação da agenda e objetivos",
            "Instruções passo a passo com exemplos visuais (prints do Minecraft)",
            "Linguagem direta, sem ambiguidades",
            "Tempo extra para resposta e pausas curtas",
            "Opções de participação com baixa sobrecarga sensorial",
        ],
    )


def default_persona(subject: str) -> Persona:
    return Persona(
        label="Estudante autista (TEA) com hiperfoco",
        description=(
            "Comunicação clara e concreta, rotina previsível, pistas visuais, "
            "tempo para processamento e estratégias de regulação sensorial."
        ),
        hyperfocus=_choose_hyperfocus(subject),
        supports=[
            "Antecipação da agenda e objetivos",
            "Instruções passo a passo com exemplos visuais",
            "Linguagem direta, sem ambiguidades",
            "Tempo extra para resposta e pausas curtas",
            "Opções de participação com baixa sobrecarga sensorial",
        ],
    )


def build_persona(subject: str, hyperfocus: Optional[str]) -> Persona:
    if hyperfocus:
        # specialized preset if matches minecraft
        if hyperfocus.strip().lower() == "minecraft":
            return minecraft_persona()
        # generic persona but with explicit hyperfocus
        p = default_persona(subject)
        p.hyperfocus = hyperfocus
        return p
    return default_persona(subject)


def local_generate(req: GenerateMaterialRequest) -> Material:
    persona = build_persona(req.assunto, req.hyperfocus)
    header = f"{req.assunto} — {req.turma or 'turma'} ({req.data or 'sem data'})"
    improve = f" Ajustes pedidos: {req.feedback}." if req.feedback else ""

    recomendacoes = (
        "Checklist de suporte (TEA + hiperfoco em "
        f"{persona.hyperfocus}):\n"
        "- Antecipe objetivos na lousa (agenda visual) e a sequência da aula.\n"
        "- Dê instruções curtas e numeradas; mostre um exemplo concreto.\n"
        f"- Ofereça opções de participação: falar, apontar, escrever ou montar no {persona.hyperfocus}.\n"
        "- Combine um sinal para pausas curtas; permita tempo extra para resposta.\n"
        "- Valide tentativas; foque no progresso e na clareza."
        f"{improve}"
    )
    roteiro = "\n".join(
        [
            f"1) Abertura ({header})",
            f'Professor: "Hoje vamos estudar {req.assunto} usando o {persona.hyperfocus} como nosso mundo de exemplos."',
            "Mostre a agenda visual (3 a 5 etapas).",
            "",
            "2) Conexão com o hiperfoco",
            f'Professor: "Se {req.assunto} fosse uma construção no {persona.hyperfocus}, que blocos/recursos seriam necessários?"',
            f'Exemplo ({persona.hyperfocus}): "Para explicar {req.assunto}, pense que precisamos coletar recursos, combinar itens e seguir um plano de construção."',
            "",
            "3) Mini‑exposição com analogias",
            "Fale frases curtas e mostre 1 imagem/diagrama. Evite parágrafos longos.",
            'Professor: "Passo 1..., Passo 2..., Passo 3..."',
            "",
            "4) Atividade guiada (passos curtos)",
            "Instrua em etapas numeradas e visíveis:",
            "- Passo 1: (ex.: listar conceitos‑bloco).",
            "- Passo 2: (ex.: ligar conceitos como se fossem crafting).",
            f"- Passo 3: (ex.: montar a 'construção' final que explica {req.assunto}).",
            "Ofereça opção de registro: quadro, caderno, cartões ou esquema que lembre crafting.",
            "",
            "5) Checagem de compreensão",
            'Pergunte: "Qual bloco/parte foi mais difícil? O que falta para completar a construção?"',
            f'Professor: "Explique usando o exemplo do {persona.hyperfocus}."',
            "",
            "6) Fechamento e tarefa",
            f"Checklist do que aprendemos. Tarefa curta: escrever/desenhar um exemplo de {req.assunto} dentro do {persona.hyperfocus}.",
        ]
    )
    resumo = (
        f"Ao final, os estudantes explicam os pontos‑chave de \"{req.assunto}\" e "
        f"relacionam com {persona.hyperfocus}. Use um mapa mental simples com "
        f"3‑5 palavras‑chave. "
        + (f'Baseie a mediação nesta descrição: "{req.descricao}".' if req.descricao else "")
    )
    exemplos = [
        f"No {persona.hyperfocus}: comparar {req.assunto} a uma construção que exige mineração de recursos, crafting e planejamento de etapas.",
        f"Usar 'redstone' como analogia para fluxos/causas‑efeitos ao explicar {req.assunto}.",
        f"Criar um 'desafio' em que cada conceito de {req.assunto} é um bloco; montar a estrutura final ligando os blocos."
    ]
    perguntas = [
        f"Se {req.assunto} fosse uma construção no {persona.hyperfocus}, que bloco faltaria para ficar estável? Por quê?",
        f"Qual parte do {req.assunto} você ligaria ao crafting? O que entra primeiro? E depois?",
        f"Explique {req.assunto} usando um exemplo de {persona.hyperfocus} que você já viu/jogou."
    ]

    return Material(
        persona=persona,
        recomendacoes=recomendacoes,
        roteiro=roteiro,
        resumo=resumo,
        exemplos=exemplos,
        perguntas=perguntas,
    )


async def openai_generate(req: GenerateMaterialRequest) -> Optional[Material]:
    if not settings.openai_api_key:
        return None

    persona = build_persona(req.assunto, req.hyperfocus)
    system = (
        "Você é uma IA pedagógica que adapta roteiros de aula para estudantes autistas. "
        "Siga rigorosamente as estratégias de suporte e o hiperfoco fornecidos. Gere um roteiro com frases prontas "
        "para o professor falar (ex.: 'Professor: ...') e exemplos explícitos usando o hiperfoco. "
        "Responda EM JSON COMPACTO com as chaves: recomendacoes (string), roteiro (string multiline), resumo (string), "
        "exemplos (array de 3 a 5 frases curtas), perguntas (array de 3 a 5 perguntas curtas). "
        "Nada de formatação markdown; apenas JSON válido."
    )

    user_payload = {
        "assunto": req.assunto,
        "descricao": req.descricao,
        "turma": req.turma,
        "data": req.data,
        "feedback": req.feedback,
        "persona": persona.dict(),
    }

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
                        {
                            "role": "user",
                            "content": "Gere material didático adaptado. Entrada (JSON): "
                            + json.dumps(user_payload, ensure_ascii=False),
                        },
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


