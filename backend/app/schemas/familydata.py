
from typing import Optional
from pydantic import BaseModel


class FamilyData(BaseModel):
    interesse: Optional[str] = None
    preferencia: Optional[str] = None
    dificuldade: Optional[str] = None
    laudo: Optional[str] = None
    observacoes: Optional[str] = None
    nivel_de_suporte: Optional[str] = None

