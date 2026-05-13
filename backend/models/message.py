from sqlalchemy import Column, Integer, String, Text, DateTime, func
from database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False)  # user | assistant | tool
    content = Column(Text, nullable=False)
    language = Column(String, default="en")
    created_at = Column(DateTime, server_default=func.now())
