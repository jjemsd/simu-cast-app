"""Session storage backed by Postgres.

The app currently treats "the session" as a single shared record. This keeps the
existing router signatures (`save_session` / `load_session` / `clear_session`)
unchanged while moving the data off the ephemeral filesystem and into Postgres
so it survives restarts on Render.

NOTE: this is still a single-row store keyed by a constant. Introduce a
per-user session id before opening the app to multiple concurrent users.
"""
from __future__ import annotations

import os
from typing import Any

from sqlalchemy import JSON, Column, String, create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./simucast.db")

# Render exposes `postgres://...` but SQLAlchemy 2.x requires the `postgresql://` scheme.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

_engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
_SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False, future=True)

_DEFAULT_KEY = "default"


class Base(DeclarativeBase):
    pass


class SessionRecord(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True)
    # JSONB on Postgres, generic JSON on other dialects (e.g. sqlite in local dev).
    data = Column(JSON().with_variant(JSONB(), "postgresql"), nullable=False)


def init_db() -> None:
    Base.metadata.create_all(_engine)


def save_session(data: dict[str, Any]) -> None:
    with _SessionLocal() as db:
        record = db.get(SessionRecord, _DEFAULT_KEY)
        if record is None:
            db.add(SessionRecord(id=_DEFAULT_KEY, data=data))
        else:
            record.data = data
        db.commit()


def load_session() -> dict[str, Any]:
    with _SessionLocal() as db:
        record = db.get(SessionRecord, _DEFAULT_KEY)
        return dict(record.data) if record else {}


def clear_session() -> None:
    with _SessionLocal() as db:
        record = db.get(SessionRecord, _DEFAULT_KEY)
        if record is not None:
            db.delete(record)
            db.commit()
