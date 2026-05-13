from sqlalchemy import Column, Integer, String, Text, DateTime, func
from database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ref_number = Column(String, unique=True, nullable=False, index=True)
    session_id = Column(String, nullable=True, index=True)
    tenant_name = Column(String, nullable=True)
    tower = Column(String, nullable=False)
    floor = Column(String, nullable=False)
    clinic_number = Column(String, nullable=True)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, nullable=False, default="P3")  # P1 | P2 | P3
    sla_deadline = Column(DateTime, nullable=True)
    status = Column(String, default="open")
    vendor_id = Column(Integer, nullable=True)
    assigned_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    resolution_note = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
