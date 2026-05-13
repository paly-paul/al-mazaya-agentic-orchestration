from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TicketCreate(BaseModel):
    session_id: Optional[str] = None
    tenant_name: Optional[str] = None
    tower: str
    floor: str
    clinic_number: Optional[str] = None
    category: str
    description: str


class TicketOut(BaseModel):
    id: int
    ref_number: str
    session_id: Optional[str]
    tenant_name: Optional[str]
    tower: str
    floor: str
    clinic_number: Optional[str]
    category: str
    description: str
    priority: str
    sla_deadline: Optional[datetime]
    status: str
    vendor_id: Optional[int]
    assigned_at: Optional[datetime]
    completed_at: Optional[datetime]
    resolution_note: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TicketVendorUpdate(BaseModel):
    vendor_id: int


class TicketPriorityUpdate(BaseModel):
    priority: str


class TicketClose(BaseModel):
    resolution_note: str
