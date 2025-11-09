
from uuid import UUID
from typing import Optional
from pydantic import BaseModel


class RecomendationCreate(BaseModel):
    aluno_id: UUID
    arrmd_id: UUID
    observacoes: str  # input livre dos pais


class RecomendationResult(BaseModel):
    aluno_id: UUID
    arrmd_id: UUID
    observacoes: str
    recomendacoes_ia: str

