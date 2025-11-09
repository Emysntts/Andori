
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.db import get_db
from app.schemas.description import DescriptionCreate, DescriptionSaved

router = APIRouter(prefix="/description", tags=["description"])


@router.post("/", response_model=DescriptionSaved)
def save_description(payload: DescriptionCreate, db: Session = Depends(get_db)) -> DescriptionSaved:
    """
    Salva a descrição fornecida pelo professor no campo alunos.descricao_do_aluno.
    """
    row = db.execute(
        text(
            """
            UPDATE public.alunos
            SET descricao_do_aluno = :descricao
            WHERE id = :aluno_id
            RETURNING id, descricao_do_aluno
            """
        ),
        {"aluno_id": str(payload.aluno_id), "descricao": payload.descricao},
    ).mappings().first()
    db.commit()
    if not row:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")
    return DescriptionSaved(aluno_id=row["id"], descricao=row["descricao_do_aluno"])

