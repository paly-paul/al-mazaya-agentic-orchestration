from sqlalchemy import Column, Integer, String, Text, Float, DateTime, func
from database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_name = Column(String, nullable=False)
    category = Column(Text, nullable=False)         # JSON array string
    towers_covered = Column(Text, nullable=False)   # JSON array string
    contact_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    trade_licence = Column(String, nullable=True)
    score = Column(Integer, default=70)
    total_jobs = Column(Integer, default=0)
    on_time_count = Column(Integer, default=0)
    late_count = Column(Integer, default=0)
    complaint_count = Column(Integer, default=0)
    no_show_count = Column(Integer, default=0)
    status = Column(String, default="onboarding")   # active | onboarding | suspended
    last_dispatched_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
