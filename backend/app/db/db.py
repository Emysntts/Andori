from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator, Optional
from app.core.config import settings

_SessionLocal: Optional[sessionmaker] = None

if settings.sqlalchemy_url:
    _engine = create_engine(
        settings.sqlalchemy_url,
        pool_pre_ping=True,
        future=True,
    )
    _SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False, future=True)
else:
    _engine = None


def get_db() -> Generator:
    """
    Strict DB dependency. Raises if SQLAlchemy URL is not configured.
    """
    if _SessionLocal is None:
        raise RuntimeError("SQLAlchemy URL not configured (settings.sqlalchemy_url is None).")
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_optional() -> Generator:
    """
    Optional DB dependency. Yields a session if configured, otherwise yields None.
    """
    if _SessionLocal is None:
        yield None
        return
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()