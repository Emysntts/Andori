
from typing import Any, Dict, Optional
from uuid import UUID
from pydantic import BaseModel


class Aula(BaseModel):
    id: UUID
    assunto: str
    descricao: str
    upload_arquivo: Dict[str, Any]


class AulaCreate(BaseModel):
    assunto: str
    descricao: str
    upload_arquivo: Dict[str, Any]


class AulaUpdate(BaseModel):
    assunto: Optional[str] = None
    descricao: Optional[str] = None
    upload_arquivo: Optional[Dict[str, Any]] = None

