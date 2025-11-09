from fastapi import APIRouter
from .routes.material import router as material_router
from .routes.students import router as students_router
from .routes.turmas import router as turmas_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(material_router)
api_router.include_router(students_router)
api_router.include_router(turmas_router)


