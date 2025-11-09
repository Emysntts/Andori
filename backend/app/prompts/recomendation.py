
from typing import Optional


def build_recommendation_prompt(observacoes_pais: str) -> str:
    """
    Constrói um prompt simples para estruturar recomendações de mediação do professor
    a partir das observações fornecidas pelos pais/responsáveis.
    """
    return (
        "Você é um especialista em inclusão escolar e intervenção pedagógica para estudantes neurodivergentes.\n"
        "A seguir estão observações dos pais sobre necessidades/cuidados do estudante.\n"
        "Devolva uma orientação prática e estruturada para o professor aplicar na aula.\n"
        "Formato esperado (texto curto, em tópicos numerados):\n"
        "1) Ambiente e previsibilidade\n"
        "2) Comunicação e instruções\n"
        "3) Interações sociais e sensorial\n"
        "4) Adaptações e alternativas de participação\n"
        "5) Sinais de sobrecarga e como agir\n\n"
        f"Observações dos pais: {observacoes_pais}\n"
        "Responda em português brasileiro."
    )

