from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.db import get_db


router = APIRouter(prefix="/estudantes", tags=["estudantes"])


class Estudante(BaseModel):
    id: UUID
    nome: str
    serie_escolar: str
    turma_id: UUID


class EstudanteCreate(BaseModel):
    nome: str
    serie_escolar: str
    turma_id: UUID


class EstudanteUpdate(BaseModel):
    nome: Optional[str] = None
    serie_escolar: Optional[str] = None
    turma_id: Optional[UUID] = None


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


@router.get("/", response_model=List[Estudante])
def list_estudantes(db: Session = Depends(get_db)):
    rows = db.execute(
        text(
            """
            SELECT id, nome, serie_escolar, turma_id
            FROM public.alunos
            ORDER BY nome
            """
        )
    ).mappings().all()
    return [Estudante(**r) for r in rows]


@router.get("/{estudante_id}", response_model=Estudante)
def get_estudante(estudante_id: UUID, db: Session = Depends(get_db)):
    row = db.execute(
        text(
            """
            SELECT id, nome, serie_escolar, turma_id
            FROM public.alunos
            WHERE id = :id
            """
        ),
        {"id": str(estudante_id)},
    ).mappings().first()
    if row is None:
        raise HTTPException(status_code=404, detail="Estudante não encontrado")
    return Estudante(**row)


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
