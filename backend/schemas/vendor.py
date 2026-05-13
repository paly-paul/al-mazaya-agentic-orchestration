from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class VendorCreate(BaseModel):
    company_name: str
    categories: List[str]
    towers_covered: List[str]
    contact_name: str
    phone: str
    email: Optional[str] = None
    trade_licence: Optional[str] = None


class VendorOut(BaseModel):
    id: int
    company_name: str
    category: str           # JSON string
    towers_covered: str     # JSON string
    contact_name: str
    phone: str
    email: Optional[str]
    trade_licence: Optional[str]
    score: int
    total_jobs: int
    on_time_count: int
    late_count: int
    complaint_count: int
    no_show_count: int
    status: str
    last_dispatched_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VendorStatusUpdate(BaseModel):
    status: str


class VendorScoreUpdate(BaseModel):
    score: int
