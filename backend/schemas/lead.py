from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from datetime import datetime


class LeadCreate(BaseModel):
    session_id: Optional[str] = None
    name: str
    phone: str
    email: Optional[str] = None
    specialty: str
    clinic_size: Optional[str] = None
    tower_preference: Optional[str] = None
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    source: Optional[str] = "web_chat"


class LeadOut(BaseModel):
    id: int
    session_id: Optional[str]
    name: str
    phone: str
    email: Optional[str]
    specialty: str
    clinic_size: Optional[str]
    tower_preference: Optional[str]
    budget_range: Optional[str]
    timeline: Optional[str]
    score: Optional[int]
    score_tier: Optional[str]
    score_breakdown: Optional[str]
    source: str
    status: str
    assigned_to: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LeadAssign(BaseModel):
    assigned_to: str


class LeadStatusUpdate(BaseModel):
    status: str
