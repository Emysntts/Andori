
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class MaterialFeedbackUpdate(BaseModel):
    arrmd_id: UUID
    feedback_material: str


class MaterialFeedback(BaseModel):
    id: UUID
    feedback_material: Optional[str] = None


class StudentFeedbackCreate(BaseModel):
    id_arrmd: UUID
    aluno_id: UUID
    feedback: str


class StudentFeedback(BaseModel):
    id: UUID
    id_arrmd: UUID
    aluno_id: UUID
    feedback: str

