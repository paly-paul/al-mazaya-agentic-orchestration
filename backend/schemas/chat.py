from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: Optional[str] = "en"
    use_case_hint: Optional[str] = None


class MessageOut(BaseModel):
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ActionTaken(BaseModel):
    tool: str
    result: Any


class StructuredOutput(BaseModel):
    type: Optional[str] = None
    payload: Optional[Any] = None


class ChatResponse(BaseModel):
    session_id: str
    message: str
    quick_replies: List[str] = []
    structured_output: Optional[StructuredOutput] = None
    actions_taken: List[ActionTaken] = []


class SessionOut(BaseModel):
    session_id: str
    use_case: Optional[str]
    language: str
    messages: List[MessageOut]
