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


@router.post("")
async def create_turma(payload: Dict[str, Any], db: Optional[Session] = Depends(get_db_optional)) -> Dict[str, Any]:
    """
    Cria uma nova turma.
    Body esperado: { "nome": "6ºA" }
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    nome = (payload or {}).get("nome")
    if not nome or not isinstance(nome, str):
        raise HTTPException(status_code=422, detail="Campo 'nome' é obrigatório.")
    turma = db.execute(
        text(
            """
            INSERT INTO public.turmas (nome)
            VALUES (:nome)
            RETURNING id, nome
            """
        ),
        {"nome": nome},
    ).mappings().first()
    db.commit()
    return {"turma": dict(turma)}


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


@router.put("/{turma_id}")
async def update_turma(turma_id: str, payload: Dict[str, Any], db: Optional[Session] = Depends(get_db_optional)) -> Dict[str, Any]:
    """
    Atualiza dados da turma (atualmente, apenas 'nome').
    Body esperado: { "nome": "6ºB" }
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    nome = (payload or {}).get("nome")
    if not nome or not isinstance(nome, str):
        raise HTTPException(status_code=422, detail="Campo 'nome' é obrigatório.")
    turma = db.execute(
        text(
            """
            UPDATE public.turmas
            SET nome = :nome
            WHERE id = :id
            RETURNING id, nome
            """
        ),
        {"id": turma_id, "nome": nome},
    ).mappings().first()
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")
    db.commit()
    return {"turma": dict(turma)}


@router.delete("/{turma_id}")
async def delete_turma(turma_id: str, db: Optional[Session] = Depends(get_db_optional)) -> Dict[str, Any]:
    """
    Exclui a turma. Alunos vinculados são excluídos por ON DELETE CASCADE.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    deleted = db.execute(
        text(
            """
            DELETE FROM public.turmas
            WHERE id = :id
            RETURNING id
            """
        ),
        {"id": turma_id},
    ).mappings().first()
    if not deleted:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")
    db.execute(
        text("DELETE FROM public.turmas_professores WHERE turma_id = :id"),
        {"id": turma_id},
    )
    db.commit()
    return {"deleted": True, "id": deleted.get("id")}


@router.put("/{turma_id}/professor")
async def set_professor(
    turma_id: str,
    payload: Dict[str, Any],
    db: Optional[Session] = Depends(get_db_optional),
) -> Dict[str, Any]:
    """
    Define/atualiza o professor vinculado à turma.
    Body esperado: { "professor_id": "<uuid>" }
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    professor_id = (payload or {}).get("professor_id")
    if not professor_id or not isinstance(professor_id, str):
        raise HTTPException(status_code=422, detail="Campo 'professor_id' é obrigatório.")
    db.execute(
        text(
            """
            INSERT INTO public.turmas_professores (turma_id, professor_id)
            VALUES (:turma_id, :professor_id)
            ON CONFLICT (turma_id) DO UPDATE
            SET professor_id = EXCLUDED.professor_id
            """
        ),
        {"turma_id": turma_id, "professor_id": professor_id},
    )
    turma = db.execute(
        text("SELECT id, nome FROM public.turmas WHERE id = :id"),
        {"id": turma_id},
    ).mappings().first()
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")
    professor = db.execute(
        text("SELECT id, nome FROM public.professores WHERE id = :id"),
        {"id": professor_id},
    ).mappings().first()
    db.commit()
    return {"turma": dict(turma), "professor": (dict(professor) if professor else None)}


@router.delete("/{turma_id}/professor")
async def unset_professor(
    turma_id: str,
    db: Optional[Session] = Depends(get_db_optional),
) -> Dict[str, Any]:
    """
    Remove o vínculo de professor da turma.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    db.execute(
        text("DELETE FROM public.turmas_professores WHERE turma_id = :id"),
        {"id": turma_id},
    )
    db.commit()
    return {"ok": True}

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


