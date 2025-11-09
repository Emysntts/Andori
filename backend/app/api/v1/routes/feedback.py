
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict, List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.db import get_db, get_db_optional
from app.schemas.feedback import (
    MaterialFeedbackUpdate,
    MaterialFeedback,
    StudentFeedbackCreate,
    StudentFeedback,
)

router = APIRouter(prefix="/feedback", tags=["feedback"])


# --- Material feedback (public.ARRMD.feedback_material) ---
@router.post("/material", response_model=MaterialFeedback)
def set_material_feedback(payload: MaterialFeedbackUpdate, db: Session = Depends(get_db)) -> MaterialFeedback:
    update_stmt = text(
        """
        UPDATE public.arrmd
        SET feedback_material = :feedback_material
        WHERE id = :id
        RETURNING id, feedback_material
        """
    )
    row = db.execute(
        update_stmt,
        {"id": str(payload.arrmd_id), "feedback_material": payload.feedback_material},
    ).mappings().first()
    db.commit()
    if not row:
        raise HTTPException(status_code=404, detail="Aula (ARRMD) não encontrada.")
    return MaterialFeedback(**row)


@router.get("/material/{arrmd_id}", response_model=MaterialFeedback)
def get_material_feedback(arrmd_id: UUID, db: Optional[Session] = Depends(get_db_optional)) -> MaterialFeedback:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    row = db.execute(
        text(
            """
            SELECT id, feedback_material
            FROM public.arrmd
            WHERE id = :id
            """
        ),
        {"id": str(arrmd_id)},
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Aula (ARRMD) não encontrada.")
    return MaterialFeedback(**row)


# --- Student personalized feedback (public.feedback_aluno_aula) ---
@router.post("/student", response_model=StudentFeedback, status_code=status.HTTP_201_CREATED)
def create_student_feedback(payload: StudentFeedbackCreate, db: Session = Depends(get_db)) -> StudentFeedback:
    insert_stmt = text(
        """
        INSERT INTO public.feedback_aluno_aula (id_arrmd, aluno_id, feedback)
        VALUES (:id_arrmd, :aluno_id, :feedback)
        RETURNING id, id_arrmd, aluno_id, feedback
        """
    )
    row = db.execute(
        insert_stmt,
        {
            "id_arrmd": str(payload.id_arrmd),
            "aluno_id": str(payload.aluno_id),
            "feedback": payload.feedback,
        },
    ).mappings().first()
    db.commit()
    if not row:
        raise HTTPException(status_code=400, detail="Falha ao criar feedback do aluno.")
    return StudentFeedback(**row)


@router.get("/student")
def list_student_feedback(
    id_arrmd: Optional[UUID] = None,
    aluno_id: Optional[UUID] = None,
    limit: int = 100,
    offset: int = 0,
    db: Optional[Session] = Depends(get_db_optional),
) -> Dict[str, Any]:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    if limit <= 0 or limit > 500:
        limit = 100
    if offset < 0:
        offset = 0

    base_query = """
        SELECT id, id_arrmd, aluno_id, feedback
        FROM public.feedback_aluno_aula
    """
    filters: List[str] = []
    params: Dict[str, Any] = {"limit": limit, "offset": offset}
    if id_arrmd:
        filters.append("id_arrmd = :id_arrmd")
        params["id_arrmd"] = str(id_arrmd)
    if aluno_id:
        filters.append("aluno_id = :aluno_id")
        params["aluno_id"] = str(aluno_id)
    if filters:
        base_query += " WHERE " + " AND ".join(filters)
    base_query += " ORDER BY id DESC LIMIT :limit OFFSET :offset"

    rows = db.execute(text(base_query), params).mappings().all()
    return {"items": [dict(r) for r in rows], "limit": limit, "offset": offset}


@router.get("/student/{aluno_id}")
def list_student_feedback_by_aluno(
    aluno_id: UUID,
    id_arrmd: Optional[UUID] = None,
    limit: int = 100,
    offset: int = 0,
    db: Optional[Session] = Depends(get_db_optional),
) -> Dict[str, Any]:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    if limit <= 0 or limit > 500:
        limit = 100
    if offset < 0:
        offset = 0

    base_query = """
        SELECT id, id_arrmd, aluno_id, feedback
        FROM public.feedback_aluno_aula
        WHERE aluno_id = :aluno_id
    """
    params: Dict[str, Any] = {"aluno_id": str(aluno_id), "limit": limit, "offset": offset}
    if id_arrmd:
        base_query += " AND id_arrmd = :id_arrmd"
        params["id_arrmd"] = str(id_arrmd)
    base_query += " ORDER BY id DESC LIMIT :limit OFFSET :offset"

    rows = db.execute(text(base_query), params).mappings().all()
    return {"items": [dict(r) for r in rows], "limit": limit, "offset": offset}

