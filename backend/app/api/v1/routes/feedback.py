
import json
from json import JSONDecodeError
from typing import Any, Dict, List, Optional, Set
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.db import get_db, get_db_optional
from app.schemas.feedback import (
    MaterialFeedbackUpdate,
    MaterialFeedback,
    StudentFeedbackCreate,
    StudentFeedback,
    StudentPerformanceEntry,
    MaterialPerformanceCreate,
    MaterialPerformance,
    StudentFeedbackParsed,
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
    material_map = _fetch_latest_materials(db, {r["id_arrmd"] for r in rows})
    items = [_deserialize_feedback_row(dict(r), material_map).model_dump() for r in rows]
    return {"items": items, "limit": limit, "offset": offset}


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
    material_map = _fetch_latest_materials(db, {r["id_arrmd"] for r in rows})
    items = [_deserialize_feedback_row(dict(r), material_map).model_dump() for r in rows]
    return {"items": items, "limit": limit, "offset": offset}


def _get_latest_material_row(db: Session, arrmd_id: UUID) -> Optional[Dict[str, Any]]:
    row = db.execute(
        text(
            """
            SELECT id, material_util, observacoes
            FROM public.arrmd_material
            WHERE aula_id = :arrmd_id
            ORDER BY created_at DESC
            LIMIT 1
            """
        ),
        {"arrmd_id": str(arrmd_id)},
    ).mappings().first()
    return dict(row) if row else None


def _parse_feedback_payload(feedback_value: Optional[str]) -> List[str]:
    if feedback_value is None:
        return []
    try:
        data = json.loads(feedback_value)
    except (JSONDecodeError, TypeError):
        if isinstance(feedback_value, str) and feedback_value.strip():
            return [feedback_value]
        return []
    if isinstance(data, dict):
        desempenho = data.get("desempenho")
        if isinstance(desempenho, list):
            return [str(item) for item in desempenho if item is not None]
        if isinstance(desempenho, str):
            return [desempenho]
    if isinstance(data, list):
        return [str(item) for item in data if item is not None]
    if isinstance(data, str):
        return [data]
    return []


def _load_material_performance(db: Session, arrmd_id: UUID) -> Optional[MaterialPerformance]:
    material_row = _get_latest_material_row(db, arrmd_id)
    if material_row is None:
        return None

    feedback_rows = db.execute(
        text(
            """
            SELECT aluno_id, feedback
            FROM public.feedback_aluno_aula
            WHERE id_arrmd = :arrmd_id
            ORDER BY aluno_id
            """
        ),
        {"arrmd_id": str(arrmd_id)},
    ).mappings().all()

    alunos_entries: List[StudentPerformanceEntry] = []
    for row in feedback_rows:
        alunos_entries.append(
            StudentPerformanceEntry(
                aluno_id=row["aluno_id"],
                desempenho=_parse_feedback_payload(row.get("feedback")),
            )
        )

    return MaterialPerformance(
        arrmd_id=arrmd_id,
        material_id=material_row["id"],
        material_util=material_row.get("material_util"),
        observacoes=material_row.get("observacoes"),
        alunos=alunos_entries,
    )


def _deserialize_feedback_row(
    row: Dict[str, Any], material_map: Dict[UUID, Dict[str, Any]]
) -> StudentFeedbackParsed:
    desempenho = _parse_feedback_payload(row.get("feedback"))
    material_info = material_map.get(row["id_arrmd"])
    return StudentFeedbackParsed(
        id=row["id"],
        id_arrmd=row["id_arrmd"],
        aluno_id=row["aluno_id"],
        feedback=row.get("feedback") or "",
        desempenho=desempenho,
        material_id=(material_info or {}).get("id"),
        material_util=(material_info or {}).get("material_util"),
        observacoes=(material_info or {}).get("observacoes"),
    )


def _fetch_latest_materials(db: Session, arrmd_ids: Set[UUID]) -> Dict[UUID, Dict[str, Any]]:
    if not arrmd_ids:
        return {}
    rows = db.execute(
        text(
            """
            SELECT DISTINCT ON (aula_id) aula_id, id, material_util, observacoes
            FROM public.arrmd_material
            WHERE aula_id = ANY(:ids)
            ORDER BY aula_id, created_at DESC
            """
        ),
        {"ids": list(arrmd_ids)},
    ).mappings().all()
    return {row["aula_id"]: dict(row) for row in rows}


@router.get("/performance/{arrmd_id}", response_model=MaterialPerformance)
def get_material_performance(arrmd_id: UUID, db: Optional[Session] = Depends(get_db_optional)) -> MaterialPerformance:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")
    performance = _load_material_performance(db, arrmd_id)
    if performance is None:
        raise HTTPException(status_code=404, detail="Desempenho não encontrado para esta aula.")
    return performance


@router.post("/performance", response_model=MaterialPerformance, status_code=status.HTTP_201_CREATED)
def upsert_material_performance(payload: MaterialPerformanceCreate, db: Session = Depends(get_db)) -> MaterialPerformance:
    material_row = _get_latest_material_row(db, payload.arrmd_id)
    if material_row is None:
        raise HTTPException(status_code=404, detail="Material não encontrado para esta aula.")

    try:
        db.execute(
            text(
                """
                UPDATE public.arrmd_material
                SET material_util = :material_util,
                    observacoes = :observacoes
                WHERE id = :material_id
                """
            ),
            {
                "material_util": payload.material_util,
                "observacoes": payload.observacoes,
                "material_id": material_row["id"],
            },
        )

        db.execute(
            text(
                """
                DELETE FROM public.feedback_aluno_aula
                WHERE id_arrmd = :arrmd_id
                """
            ),
            {"arrmd_id": str(payload.arrmd_id)},
        )

        insert_stmt = text(
            """
            INSERT INTO public.feedback_aluno_aula (id_arrmd, aluno_id, feedback)
            VALUES (:id_arrmd, :aluno_id, :feedback)
            """
        )
        for entry in payload.alunos:
            feedback_payload = json.dumps({"desempenho": entry.desempenho or []})
            db.execute(
                insert_stmt,
                {
                    "id_arrmd": str(payload.arrmd_id),
                    "aluno_id": str(entry.aluno_id),
                    "feedback": feedback_payload,
                },
            )
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Não foi possível salvar o desempenho: {exc}") from exc

    performance = _load_material_performance(db, payload.arrmd_id)
    if performance is None:
        raise HTTPException(status_code=500, detail="Falha ao carregar o desempenho salvo.")
    return performance


@router.delete("/performance/{arrmd_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material_performance(arrmd_id: UUID, db: Session = Depends(get_db)) -> None:
    material_row = _get_latest_material_row(db, arrmd_id)
    if material_row is None:
        raise HTTPException(status_code=404, detail="Material não encontrado para esta aula.")

    db.execute(
        text(
            """
            UPDATE public.arrmd_material
            SET material_util = NULL,
                observacoes = NULL
            WHERE id = :material_id
            """
        ),
        {"material_id": material_row["id"]},
    )
    result = db.execute(
        text(
            """
            DELETE FROM public.feedback_aluno_aula
            WHERE id_arrmd = :arrmd_id
            """
        ),
        {"arrmd_id": str(arrmd_id)},
    )
    if result.rowcount == 0:
        # Nenhum registro de desempenho, mas ainda assim consideramos operação válida caso existisse apenas dados agregados
        db.commit()
        return None
    db.commit()
    return None

