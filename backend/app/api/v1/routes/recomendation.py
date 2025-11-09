
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.db import get_db, get_db_optional
from app.core.config import settings
from app.schemas.recomendation import RecomendationCreate, RecomendationResult
from app.prompts.recomendation import build_recommendation_prompt
import httpx
import json

router = APIRouter(prefix="/recomendation", tags=["recomendation"])


async def _generate_ai_recommendations(observacoes: str) -> Optional[str]:
    """
    Usa OpenAI quando configurado. Se não houver chave ou falhar, retorna um texto básico.
    """
    prompt = build_recommendation_prompt(observacoes)
    if not settings.openai_api_key:
        # fallback simples
        return (
            "1) Evitar toques físicos não solicitados e oferecer alternativas de cumprimento.\n"
            "2) Usar instruções curtas e visuais; combinar previamente mudanças na rotina.\n"
            "3) Dar opções de participação com menor carga sensorial; permitir pausas rápidas.\n"
            "4) Oferecer alternativa de comunicação (gestos/cartões) se necessário.\n"
            "5) Se notar sinais de sobrecarga, reduzir estímulos e orientar respiração curta."
        )
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.openai_model,
                    "temperature": settings.openai_temperature,
                    "response_format": {"type": "text"},
                    "messages": [
                        {"role": "system", "content": "Você é um especialista em inclusão escolar."},
                        {"role": "user", "content": prompt},
                    ],
                },
            )
        r.raise_for_status()
        data = r.json()
        content = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )
        return content.strip() or None
    except Exception:
        return None


@router.post("/", response_model=RecomendationResult)
async def create_recomendation(payload: RecomendationCreate, db: Session = Depends(get_db)) -> RecomendationResult:
    """
    1) Salva observações dos pais em public.alunos.observacoes
    2) Gera recomendações estruturadas via LLM (ou fallback)
    3) Salva resultado em public.arrmd.recomendacoes_ia
    """
    # 1) salvar observações no aluno
    db.execute(
        text(
            """
            UPDATE public.alunos
            SET observacoes = :observacoes
            WHERE id = :aluno_id
            """
        ),
        {"aluno_id": str(payload.aluno_id), "observacoes": payload.observacoes},
    )
    db.commit()

    # 2) gerar recomendações via LLM/fallback
    recomendacoes = await _generate_ai_recommendations(payload.observacoes)
    if recomendacoes is None:
        recomendacoes = "Sem recomendações estruturadas no momento."

    # 3) salvar no ARRMD
    row = db.execute(
        text(
            """
            UPDATE public.arrmd
            SET recomendacoes_ia = :recomendacoes
            WHERE id = :arrmd_id
            RETURNING id
            """
        ),
        {"arrmd_id": str(payload.arrmd_id), "recomendacoes": recomendacoes},
    ).mappings().first()
    db.commit()
    if not row:
        raise HTTPException(status_code=404, detail="Aula (ARRMD) não encontrada.")

    return RecomendationResult(
        aluno_id=payload.aluno_id,
        arrmd_id=payload.arrmd_id,
        observacoes=payload.observacoes,
        recomendacoes_ia=recomendacoes,
    )


@router.get("")
def get_recomendations(
    aluno_id: Optional[str] = None,
    arrmd_id: Optional[str] = None,
    db: Optional[Session] = Depends(get_db_optional),
) -> Dict[str, Any]:
    """
    Busca observações dos pais (por aluno_id) e/ou recomendações da IA (por arrmd_id).
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Banco de dados não configurado.")

    result: Dict[str, Any] = {}
    if aluno_id:
        obs_row = db.execute(
            text("SELECT observacoes FROM public.alunos WHERE id = :aluno_id"),
            {"aluno_id": aluno_id},
        ).mappings().first()
        if obs_row:
            result["observacoes"] = obs_row["observacoes"]
    if arrmd_id:
        ia_row = db.execute(
            text("SELECT recomendacoes_ia FROM public.arrmd WHERE id = :arrmd_id"),
            {"arrmd_id": arrmd_id},
        ).mappings().first()
        if ia_row:
            result["recomendacoes_ia"] = ia_row["recomendacoes_ia"]

    if not result:
        raise HTTPException(status_code=404, detail="Nenhum conteúdo encontrado para os parâmetros informados.")
    return result

