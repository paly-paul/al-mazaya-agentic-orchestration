from sqlalchemy import Column, Integer, String, Text, DateTime, func
from database import Base


class Briefing(Base):
    __tablename__ = "briefings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    period = Column(String, nullable=False)          # daily | weekly
    generated_at = Column(DateTime, server_default=func.now())
    briefing_en = Column(Text, nullable=False)
    briefing_ar = Column(Text, nullable=False)
    alerts = Column(Text, nullable=True)             # JSON array string
