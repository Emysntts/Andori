from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Any, Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.db import get_db_optional

router = APIRouter(prefix="/turmas", tags=["turmas"])


@router.get("")
async def list_turmas(db: Optional[Session] = Depends(get_db_optional)) -> Dict[str, Any]:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    rows = db.execute(
        text(
            """
            SELECT t.id, t.nome
            FROM public.turmas t
            ORDER BY t.nome
            """
        )
    ).mappings().all()
    return {"items": [dict(r) for r in rows]}


@router.get("/{turma_id}")
async def get_turma(turma_id: str, db: Optional[Session] = Depends(get_db_optional)) -> Dict[str, Any]:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    turma = db.execute(
        text(
            """
            SELECT t.id, t.nome
            FROM public.turmas t
            WHERE t.id = :id
            """
        ),
        {"id": turma_id},
    ).mappings().first()
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")
    professores = db.execute(
        text(
            """
            SELECT p.id, p.nome
            FROM public.turmas_professores tp
            JOIN public.professores p ON p.id = tp.professor_id
            WHERE tp.turma_id = :id
            """
        ),
        {"id": turma_id},
    ).mappings().all()
    return {"turma": dict(turma), "professores": [dict(p) for p in professores]}


@router.get("/{turma_id}/students")
async def list_students_in_turma(
    turma_id: str,
    db: Optional[Session] = Depends(get_db_optional),
) -> Dict[str, Any]:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    rows = db.execute(
        text(
            """
            SELECT a.id, a.nome
            FROM public.alunos a
            WHERE a.turma_id = :id
            ORDER BY a.nome
            """
        ),
        {"id": turma_id},
    ).mappings().all()
    return {"items": [dict(r) for r in rows]}


