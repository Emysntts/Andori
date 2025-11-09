from fastapi import APIRouter
from .routes.material import router as material_router
from .routes.students import router as students_router
from .routes.turmas import router as turmas_router
from .routes.aulas import router as aulas_router
from .routes.description import router as description_router
from .routes.familydata import router as familydata_router
from .routes.feedback import router as feedback_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(material_router)
api_router.include_router(students_router)
api_router.include_router(turmas_router)
api_router.include_router(aulas_router)
api_router.include_router(description_router)
api_router.include_router(familydata_router)
api_router.include_router(feedback_router)


