from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Any, Dict

from app.schemas.lesson import GenerateMaterialRequest, GenerateMaterialResponse
from app.services.lesson_generation import local_generate, openai_generate, fetch_student_profile
from app.prompts import build_llm_payload
from app.db.db import get_db_optional
from sqlalchemy.orm import Session

router = APIRouter(prefix="/material", tags=["material"])


@router.post("/generate", response_model=GenerateMaterialResponse)
async def generate_material(req: GenerateMaterialRequest, db: Optional[Session] = Depends(get_db_optional)):
    student = fetch_student_profile(db, req.aluno_id)
    result = await openai_generate(req, student)
    source = "openai" if result is not None else "fallback"

    if result is None:
        result = local_generate(req, student)

    return {**result, "source": source}


@router.post("/inputs/preview")
async def preview_llm_inputs(req: GenerateMaterialRequest, db: Optional[Session] = Depends(get_db_optional)) -> Dict[str, Any]:
    """
    Retorna o JSON que será enviado à LLM, já enriquecido com dados do aluno (quando fornecido).
    """
    student = fetch_student_profile(db, req.aluno_id)
    payload = build_llm_payload(req, student)
    return {"payload": payload}

 


