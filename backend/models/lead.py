from sqlalchemy import Column, Integer, String, Float, DateTime, func
from database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, nullable=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    specialty = Column(String, nullable=False)
    clinic_size = Column(String, nullable=True)  # small | medium | large | unknown
    tower_preference = Column(String, nullable=True)
    budget_range = Column(String, nullable=True)
    timeline = Column(String, nullable=True)
    score = Column(Integer, nullable=True)
    score_tier = Column(String, nullable=True)  # hot | warm | cold
    score_breakdown = Column(String, nullable=True)  # JSON string
    source = Column(String, default="web_chat")  # web_chat | whatsapp | email | hotline
    status = Column(String, default="new")
    assigned_to = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
