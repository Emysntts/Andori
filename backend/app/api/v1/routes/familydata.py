from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.db import get_db_optional
from app.schemas.familydata import FamilyData

router = APIRouter(prefix="/familydata", tags=["familydata"])


@router.get("/{aluno_id}", response_model=FamilyData)
def get_family_data(aluno_id: str, db: Optional[Session] = Depends(get_db_optional)) -> FamilyData:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    row = db.execute(
        text(
            """
            SELECT 
                interesse,
                preferencia,
                dificuldade,
                laudo,
                observacoes,
                nivel_de_suporte
            FROM public.alunos
            WHERE id = :aluno_id
            """
        ),
        {"aluno_id": aluno_id},
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")
    return FamilyData(**row)
