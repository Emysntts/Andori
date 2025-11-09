from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.schemas.lesson import Roteiro, Resumo


class MaterialCreate(BaseModel):
    aula_id: UUID
    roteiro: Roteiro
    resumo: Resumo
    source: Optional[str] = None
    accepted: bool = True
    recomendacoes_ia: Optional[str] = None
    material_util: Optional[str] = None
    observacoes: Optional[str] = None


class Material(MaterialCreate):
    id: UUID
    created_at: datetime



