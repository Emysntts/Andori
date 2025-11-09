
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


class StudentFeedbackParsed(StudentFeedback):
    desempenho: List[str] = []
    material_id: Optional[UUID] = None
    material_util: Optional[str] = None
    observacoes: Optional[str] = None


class StudentPerformanceEntry(BaseModel):
    aluno_id: UUID
    desempenho: List[str]


class MaterialPerformanceBase(BaseModel):
    arrmd_id: UUID
    material_util: Optional[str] = None
    observacoes: Optional[str] = None
    alunos: List[StudentPerformanceEntry]


class MaterialPerformanceCreate(MaterialPerformanceBase):
    pass


class MaterialPerformance(MaterialPerformanceBase):
    material_id: UUID

