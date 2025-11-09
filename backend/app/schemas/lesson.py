from pydantic import BaseModel
from typing import Optional, List


class GenerateMaterialRequest(BaseModel):
    assunto: str
    disciplina: Optional[str] = None
    descricao: str = ""
    turma: str = ""
    data: str = ""
    feedback: Optional[str] = None
    hyperfocus: Optional[str] = None
    aluno_id: Optional[str] = None
    turma_id: Optional[str] = None
    arquivo_b64: Optional[str] = None


class Roteiro(BaseModel):
    """
    Estrutura principal para a aula. Mantém a aula inclusiva e normal para toda a turma,
    usando o Interesse do publico neurodivergente (quando existir) apenas como fonte de exemplos e analogias.
    - topicos: tópicos/etapas principais que o professor vai cobrir (bullets curtos)
    - falas: falas prontas/roteirizadas em 1 a 2 frases, sem parágrafos longos
    - exemplos: 3 a 5 exemplos/analogias; se houver Interesse do publico neurodivergente, pelo menos 1 exemplo alinhado
    """
    topicos: List[str]
    falas: List[str]
    exemplos: List[str]


class Resumo(BaseModel):
    """
    Resumo curto da aula com um exemplo representativo.
    """
    texto: str
    exemplo: str


class GenerateMaterialResponse(BaseModel):
    roteiro: Roteiro
    resumo: Resumo
    source: str


