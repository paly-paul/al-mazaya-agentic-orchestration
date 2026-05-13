"""
Database initialisation script.
Run once on first deployment: python migrations/init_db.py
Creates all tables in SQLite (PoC) or PostgreSQL (production).
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, Base
import models  # noqa: F401 — imports all ORM models so Base.metadata is populated


def init_db() -> None:
    print(f"Creating tables on: {engine.url}")
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully.")


if __name__ == "__main__":
    init_db()
