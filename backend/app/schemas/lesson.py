from pydantic import BaseModel
from typing import Optional, List


class Persona(BaseModel):
    label: str
    description: str
    hyperfocus: str
    supports: List[str]


class GenerateMaterialRequest(BaseModel):
    assunto: str
    descricao: str = ""
    turma: str = ""
    data: str = ""
    feedback: Optional[str] = None
    hyperfocus: Optional[str] = None


class Material(BaseModel):
    persona: Persona
    recomendacoes: str
    roteiro: str
    resumo: str
    exemplos: Optional[list[str]] = None
    perguntas: Optional[list[str]] = None


class GenerateMaterialResponse(BaseModel):
    material: Material
    source: str


