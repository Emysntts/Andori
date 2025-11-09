from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Any, Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.db import get_db_optional

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/{aluno_id}")
async def get_student_profile(aluno_id: str, db: Optional[Session] = Depends(get_db_optional)) -> Dict[str, Any]:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    row = db.execute(
        text(
            """
            SELECT a.id,
                   a.nome,
                   a.interesse,
                   a.preferencia,
                   a.dificuldade,
                   a.laudo,
                   a.observacoes,
                   a.recomendacoes,
                   a.nivel_de_suporte,
                   a.descricao_do_aluno,
                   a.turma_id,
                   t.nome AS turma_nome
            FROM public.alunos a
            LEFT JOIN public.turmas t ON t.id = a.turma_id
            WHERE a.id = :aluno_id
            """
        ),
        {"aluno_id": aluno_id},
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")
    return {"student_profile": dict(row)}


@router.get("")
async def list_students(
    turma_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Optional[Session] = Depends(get_db_optional),
) -> Dict[str, Any]:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    if limit <= 0 or limit > 200:
        limit = 50
    if offset < 0:
        offset = 0
    if turma_id:
        rows = db.execute(
            text(
                """
                SELECT a.id, a.nome, a.turma_id, t.nome AS turma_nome
                FROM public.alunos a
                LEFT JOIN public.turmas t ON t.id = a.turma_id
                WHERE a.turma_id = :turma_id
                ORDER BY a.nome
                LIMIT :limit OFFSET :offset
                """
            ),
            {"turma_id": turma_id, "limit": limit, "offset": offset},
        ).mappings().all()
    else:
        rows = db.execute(
            text(
                """
                SELECT a.id, a.nome, a.turma_id, t.nome AS turma_nome
                FROM public.alunos a
                LEFT JOIN public.turmas t ON t.id = a.turma_id
                ORDER BY a.nome
                LIMIT :limit OFFSET :offset
                """
            ),
            {"limit": limit, "offset": offset},
        ).mappings().all()
    return {"items": [dict(r) for r in rows], "limit": limit, "offset": offset}


