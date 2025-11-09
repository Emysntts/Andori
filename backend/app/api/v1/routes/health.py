# app/api/v1/routes/health.py
from fastapi import APIRouter
from sqlalchemy import text
from app.db.db import engine

router = APIRouter()

@router.get("/db")
def health_db():
    with engine.connect() as conn:
        conn.execute(text("select 1"))
    return {"database": "ok"}