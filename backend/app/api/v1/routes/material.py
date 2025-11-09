from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Any, Dict

from app.schemas.lesson import GenerateMaterialRequest, GenerateMaterialResponse
from app.services.lesson_generation import local_generate, openai_generate, fetch_student_profile, fetch_turma_context, fetch_turma_context_by_name_or_year
from app.llm.prompts import build_llm_payload
from app.db.db import get_db_optional
from sqlalchemy.orm import Session

router = APIRouter(prefix="/material", tags=["material"])


@router.post("/generate", response_model=GenerateMaterialResponse)
async def generate_material(req: GenerateMaterialRequest, db: Optional[Session] = Depends(get_db_optional)):
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
    if result is None:
        raise HTTPException(status_code=503, detail="Serviço de geração indisponível")
    return {**result, "source": "openai"}


@router.post("/inputs/preview")
async def preview_llm_inputs(req: GenerateMaterialRequest, db: Optional[Session] = Depends(get_db_optional)) -> Dict[str, Any]:
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

 


