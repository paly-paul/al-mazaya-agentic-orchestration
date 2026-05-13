from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True)
    user_type = Column(String, nullable=False)  # tenant | prospect | vendor | management
    language = Column(String, default="en")
    use_case = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    last_active_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
