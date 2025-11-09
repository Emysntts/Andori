
from typing import Any, Dict, Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import date


class Aula(BaseModel):
    id: UUID
    assunto: str
    descricao: str
    data: Optional[date] = None
    upload_arquivo: Dict[str, Any]


class AulaCreate(BaseModel):
    assunto: str
    descricao: str
    data: Optional[date] = None
    upload_arquivo: Dict[str, Any]


class AulaUpdate(BaseModel):
    assunto: Optional[str] = None
    descricao: Optional[str] = None
    data: Optional[date] = None
    upload_arquivo: Optional[Dict[str, Any]] = None

