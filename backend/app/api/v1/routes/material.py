from fastapi import APIRouter

from app.schemas.lesson import GenerateMaterialRequest, GenerateMaterialResponse
from app.services.lesson_generation import local_generate, openai_generate

router = APIRouter(prefix="/material", tags=["material"])


@router.post("/generate", response_model=GenerateMaterialResponse)
async def generate_material(req: GenerateMaterialRequest):
    material = await openai_generate(req)
    source = "openai" if material is not None else "fallback"

    if material is None:
        material = local_generate(req)

    return {"material": material, "source": source}


