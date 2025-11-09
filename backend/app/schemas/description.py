
from uuid import UUID
from pydantic import BaseModel


class DescriptionCreate(BaseModel):
    aluno_id: UUID
    descricao: str


class DescriptionSaved(BaseModel):
    aluno_id: UUID
    descricao: str







