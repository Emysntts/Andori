from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import text

import json

from app.db.db import get_db, get_db_optional
from app.schemas.aulas import Aula, AulaCreate, AulaUpdate

router = APIRouter(prefix="/aulas", tags=["aulas"])


def _normalize_upload(row: Dict[str, Any]) -> Dict[str, Any]:
    """Garantir que upload_arquivo seja um dicionário decodificado."""
    raw_value = row.get("upload_arquivo")
    if isinstance(raw_value, str):
        try:
            row["upload_arquivo"] = json.loads(raw_value)
        except json.JSONDecodeError:
            row["upload_arquivo"] = {}
    elif raw_value is None:
        row["upload_arquivo"] = {}
    return row


@router.post("", status_code=status.HTTP_201_CREATED)
def create_aula(payload: Dict[str, Any], db: Optional[Session] = Depends(get_db_optional)) -> Dict[str, Any]:
    """
    Cria uma nova aula.
    Payload esperado: {
        "assunto": "Matemática",
        "turma": "6º A",
        "data": "DD/MM",
        "descricao": "Descrição da aula"
    }
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    
    extras = payload.get("upload_arquivo")
    if isinstance(extras, dict):
        metadata = dict(extras)
    else:
        metadata = {}

    turma_id = payload.get("turma_id") or payload.get("turmaId")
    turma_nome = payload.get("turma_nome") or payload.get("turma")
    arquivo_payload = payload.get("arquivo")
    if arquivo_payload is not None:
        try:
            json.dumps(arquivo_payload)
        except TypeError:
            arquivo_payload = None

    metadata.update(
        {
            "turma_id": turma_id,
            "turma": turma_nome,
            "turma_nome": turma_nome,
            "data": payload.get("data"),
            "arquivo": arquivo_payload,
        }
    )

    insert_stmt = text(
        """
        INSERT INTO public.arrmd (assunto, descricao, upload_arquivo)
        VALUES (:assunto, :descricao, :upload_arquivo)
        RETURNING id, assunto, descricao, upload_arquivo
        """
    )
    try:
        row = db.execute(
            insert_stmt,
            {
                "assunto": payload.get("assunto"),
                "descricao": payload.get("descricao"),
                "upload_arquivo": json.dumps(metadata),
            },
        ).mappings().first()
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Não foi possível criar a aula: {exc}"
        ) from exc

    if row is None:
        raise HTTPException(status_code=500, detail="Falha ao retornar a aula criada")
    return {"aula": _normalize_upload(dict(row))}


@router.get("/{aula_id}", response_model=Aula)
def get_aula(aula_id: UUID, db: Optional[Session] = Depends(get_db_optional)) -> Aula:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    row = db.execute(
        text(
            """
            SELECT id, assunto, descricao, upload_arquivo
            FROM public.arrmd
            WHERE id = :id
            """
        ),
        {"id": str(aula_id)},
    ).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Aula não encontrada.")
    return Aula(**_normalize_upload(dict(row)))


@router.get("")
def list_aulas(
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

    rows = db.execute(
        text(
            """
            SELECT id, assunto, descricao, upload_arquivo
            FROM public.arrmd
            ORDER BY assunto
            LIMIT :limit OFFSET :offset
            """
        ),
        {"limit": limit, "offset": offset},
    ).mappings().all()
    normalized = [_normalize_upload(dict(r)) for r in rows]
    return {"items": normalized, "limit": limit, "offset": offset}


@router.put("/{aula_id}", response_model=Aula)
def update_aula(aula_id: UUID, payload: AulaUpdate, db: Session = Depends(get_db)) -> Aula:
    update_stmt = text(
        """
        UPDATE public.arrmd
        SET
            assunto = COALESCE(:assunto, assunto),
            descricao = COALESCE(:descricao, descricao),
            upload_arquivo = COALESCE(:upload_arquivo, upload_arquivo)
        WHERE id = :id
        RETURNING id, assunto, descricao, upload_arquivo
        """
    )
    try:
        row = db.execute(
            update_stmt,
            {
                "id": str(aula_id),
                "assunto": payload.assunto,
                "descricao": payload.descricao,
                "upload_arquivo": payload.upload_arquivo,
            },
        ).mappings().first()
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Não foi possível atualizar a aula") from exc

    if row is None:
        raise HTTPException(status_code=404, detail="Aula não encontrada")
    return Aula(**_normalize_upload(dict(row)))


@router.delete("/{aula_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_aula(aula_id: UUID, db: Session = Depends(get_db)) -> None:
    result = db.execute(
        text(
            """
            DELETE FROM public.arrmd
            WHERE id = :id
            """
        ),
        {"id": str(aula_id)},
    )
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Aula não encontrada")
    return None


