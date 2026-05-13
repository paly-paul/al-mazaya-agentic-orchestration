from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class WorkOrderCreate(BaseModel):
    session_id: Optional[str] = None
    tenant_name: Optional[str] = None
    tower: Optional[str] = None
    floor: Optional[str] = None
    service_type: str
    specification: Optional[Any] = None
    quote_amount: float
    quote_breakdown: Optional[Any] = None


class WorkOrderOut(BaseModel):
    id: int
    ref_number: str
    session_id: Optional[str]
    tenant_name: Optional[str]
    tower: Optional[str]
    floor: Optional[str]
    service_type: str
    specification: Optional[str]
    quote_amount: float
    quote_breakdown: Optional[str]
    approval_status: str
    approved_by: Optional[str]
    rejected_by: Optional[str]
    rejection_reason: Optional[str]
    vendor_id: Optional[int]
    scheduled_date: Optional[datetime]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkOrderApprove(BaseModel):
    approved_by: str


class WorkOrderReject(BaseModel):
    rejected_by: str
    reason: str
