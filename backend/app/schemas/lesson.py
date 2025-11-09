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


class Material(BaseModel):
    recomendacoes: str
    roteiro: str
    resumo: str
    exemplos: Optional[list[str]] = None
    perguntas: Optional[list[str]] = None


class GenerateMaterialResponse(BaseModel):
    material: Material
    source: str


