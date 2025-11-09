from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, Any, Dict, List
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.students import Estudante, EstudanteCreate, EstudanteUpdate


from app.db.db import get_db, get_db_optional

router = APIRouter(prefix="/students", tags=["students"])


@router.post("/", response_model=Estudante, status_code=status.HTTP_201_CREATED)
def create_estudante(payload: EstudanteCreate, db: Session = Depends(get_db)):
    insert_stmt = text(
        """
        INSERT INTO public.alunos (nome, serie_escolar, turma_id)
        VALUES (:nome, :serie_escolar, :turma_id)
        RETURNING id, nome, serie_escolar, turma_id
        """
    )
    try:
        row = db.execute(
            insert_stmt,
            {
                "nome": payload.nome,
                "serie_escolar": payload.serie_escolar,
                "turma_id": str(payload.turma_id),
            },
        ).mappings().first()
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Não foi possível criar o estudante") from exc

    if row is None:
        raise HTTPException(status_code=500, detail="Falha ao retornar estudante criado")
    return Estudante(**row)


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


@router.put("/{estudante_id}", response_model=Estudante)
def update_estudante(estudante_id: UUID, payload: EstudanteUpdate, db: Session = Depends(get_db)):
    # Atualização parcial simples usando COALESCE para manter valores atuais
    update_stmt = text(
        """
        UPDATE public.alunos
        SET
            nome = COALESCE(:nome, nome),
            serie_escolar = COALESCE(:serie_escolar, serie_escolar),
            turma_id = COALESCE(:turma_id, turma_id)
        WHERE id = :id
        RETURNING id, nome, serie_escolar, turma_id
        """
    )
    try:
        row = db.execute(
            update_stmt,
            {
                "id": str(estudante_id),
                "nome": payload.nome,
                "serie_escolar": payload.serie_escolar,
                "turma_id": str(payload.turma_id) if payload.turma_id is not None else None,
            },
        ).mappings().first()
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Não foi possível atualizar o estudante") from exc

    if row is None:
        raise HTTPException(status_code=404, detail="Estudante não encontrado")
    return Estudante(**row)

@router.delete("/{estudante_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_estudante(estudante_id: UUID, db: Session = Depends(get_db)):
    result = db.execute(
        text(
            """
            DELETE FROM public.alunos
            WHERE id = :id
            """
        ),
        {"id": str(estudante_id)},
    )
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Estudante não encontrado")
    return None


