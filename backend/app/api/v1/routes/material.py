import json
from typing import Optional, Any, Dict, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas.lesson import (
    GenerateMaterialRequest,
    GenerateMaterialResponse,
    Roteiro,
    Resumo,
)
from app.schemas.material import MaterialCreate, Material
from app.services.lesson_generation import (
    local_generate,
    openai_generate,
    fetch_student_profile,
    fetch_turma_context,
    fetch_turma_context_by_name_or_year,
)
from app.llm.prompts import build_llm_payload
from app.db.db import get_db_optional, get_db

router = APIRouter(prefix="/material", tags=["material"])


@router.post("/generate", response_model=GenerateMaterialResponse)
async def generate_material(
    req: GenerateMaterialRequest,
    db: Optional[Session] = Depends(get_db_optional),
):
    turma_ctx = fetch_turma_context(db, req.turma_id) or fetch_turma_context_by_name_or_year(db, req.turma)
    student = fetch_student_profile(db, req.aluno_id)
    if student is None and turma_ctx and (alunos := turma_ctx.get("alunos")):
        for a in alunos:
            if (a.get("interesse") or a.get("preferencia")):
                student = {
                    "id": a.get("id"),
                    "nome": a.get("nome"),
                    "interesse": a.get("interesse"),
                    "preferencia": a.get("preferencia"),
                    "nivel_de_suporte": a.get("nivel_de_suporte"),
                    "descricao_do_aluno": a.get("descricao_do_aluno"),
                    "turma_id": req.turma_id,
                    "turma_nome": turma_ctx.get("turma_nome"),
                }
                break
    result = await openai_generate(req, student, turma_ctx)
    if result is not None:
        return {**result, "source": "openai"}

    fallback = local_generate(req, student)
    if fallback:
        return {**fallback, "source": "local"}

    raise HTTPException(status_code=503, detail="Serviço de geração indisponível")


@router.post("/inputs/preview")
async def preview_llm_inputs(
    req: GenerateMaterialRequest,
    db: Optional[Session] = Depends(get_db_optional),
) -> Dict[str, Any]:
    """
    Retorna o JSON que será enviado à LLM, já enriquecido com dados do aluno (quando fornecido).
    """
    turma_ctx = fetch_turma_context(db, req.turma_id) or fetch_turma_context_by_name_or_year(db, req.turma)
    student = fetch_student_profile(db, req.aluno_id)
    if student is None and turma_ctx and (alunos := turma_ctx.get("alunos")):
        for a in alunos:
            if (a.get("interesse") or a.get("preferencia")):
                student = {
                    "id": a.get("id"),
                    "nome": a.get("nome"),
                    "interesse": a.get("interesse"),
                    "preferencia": a.get("preferencia"),
                    "nivel_de_suporte": a.get("nivel_de_suporte"),
                    "descricao_do_aluno": a.get("descricao_do_aluno"),
                    "turma_id": req.turma_id,
                    "turma_nome": turma_ctx.get("turma_nome"),
                }
                break
    payload = build_llm_payload(req, student, turma_ctx)
    return {"payload": payload}


def _material_from_row(row: Dict[str, Any]) -> Material:
    roteiro_data = row.get("roteiro") or {}
    resumo_data = row.get("resumo") or {}
    return Material(
        id=row["id"],
        aula_id=row["aula_id"],
        roteiro=Roteiro(
            topicos=roteiro_data.get("topicos", []),
            falas=roteiro_data.get("falas", []),
            exemplos=roteiro_data.get("exemplos", []),
        ),
        resumo=Resumo(
            texto=resumo_data.get("texto", ""),
            exemplo=resumo_data.get("exemplo", ""),
        ),
        source=row.get("source"),
        accepted=row.get("accepted", True),
        recomendacoes_ia=row.get("recomendacoes_ia"),
        created_at=row["created_at"],
        material_util=row.get("material_util"),
        observacoes=row.get("observacoes"),
    )


@router.post("/accept", response_model=Material, status_code=status.HTTP_201_CREATED)
def accept_material(payload: MaterialCreate, db: Session = Depends(get_db)) -> Material:
    exists = db.execute(
        text(
            """
            SELECT 1
            FROM public.arrmd
            WHERE id = :id
            """
        ),
        {"id": str(payload.aula_id)},
    ).scalar()
    if not exists:
        raise HTTPException(status_code=404, detail="Aula não encontrada.")

    insert_stmt = text(
        """
        INSERT INTO public.arrmd_material
            (aula_id, roteiro, resumo, source, accepted, recomendacoes_ia, material_util, observacoes)
        VALUES
            (:aula_id, :roteiro, :resumo, :source, :accepted, :recomendacoes_ia, :material_util, :observacoes)
        RETURNING id, aula_id, roteiro, resumo, source, accepted, recomendacoes_ia, created_at, material_util, observacoes
        """
    )
    row = db.execute(
        insert_stmt,
        {
            "aula_id": str(payload.aula_id),
            "roteiro": json.dumps(payload.roteiro.model_dump()),
            "resumo": json.dumps(payload.resumo.model_dump()),
            "source": payload.source,
            "accepted": payload.accepted,
            "recomendacoes_ia": payload.recomendacoes_ia,
            "material_util": payload.material_util,
            "observacoes": payload.observacoes,
        },
    ).mappings().first()
    db.commit()
    if not row:
        raise HTTPException(status_code=400, detail="Falha ao salvar material.")

    row_dict = dict(row)
    row_dict["roteiro"] = payload.roteiro.model_dump()
    row_dict["resumo"] = payload.resumo.model_dump()
    if "material_util" not in row_dict:
        row_dict["material_util"] = payload.material_util
    if "observacoes" not in row_dict:
        row_dict["observacoes"] = payload.observacoes
    return _material_from_row(row_dict)


@router.get("/aula/{aula_id}", response_model=List[Material])
def list_material_by_aula(
    aula_id: UUID,
    db: Optional[Session] = Depends(get_db_optional),
) -> List[Material]:
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")

    rows = db.execute(
        text(
            """
            SELECT id, aula_id, roteiro, resumo, source, accepted, recomendacoes_ia, created_at, material_util, observacoes
            FROM public.arrmd_material
            WHERE aula_id = :aula_id
            ORDER BY created_at DESC
            """
        ),
        {"aula_id": str(aula_id)},
    ).mappings().all()

    materials: List[Material] = []
    for row in rows:
        row_dict = dict(row)
        materials.append(
            _material_from_row(
                {
                    **row_dict,
                    "roteiro": row_dict.get("roteiro") or {},
                    "resumo": row_dict.get("resumo") or {},
                    "material_util": row_dict.get("material_util"),
                    "observacoes": row_dict.get("observacoes"),
                }
            )
        )
    return materials


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(material_id: UUID, db: Session = Depends(get_db)) -> None:
    result = db.execute(
        text(
            """
            DELETE FROM public.arrmd_material
            WHERE id = :id
            """
        ),
        {"id": str(material_id)},
    )
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Material não encontrado.")
    return None