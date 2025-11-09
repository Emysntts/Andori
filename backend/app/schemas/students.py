from uuid import UUID
from typing import Optional
from pydantic import BaseModel

class Estudante(BaseModel):
    id: UUID
    nome: str
    serie_escolar: str
    turma_id: UUID


class EstudanteCreate(BaseModel):
    nome: str
    serie_escolar: str
    turma_id: UUID


class EstudanteUpdate(BaseModel):
    nome: Optional[str] = None
    serie_escolar: Optional[str] = None
    turma_id: Optional[UUID] = None
