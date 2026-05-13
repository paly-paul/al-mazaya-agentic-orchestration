from sqlalchemy import Column, Integer, String, Text, Float, DateTime, func
from database import Base


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ref_number = Column(String, unique=True, nullable=False, index=True)
    session_id = Column(String, nullable=True, index=True)
    tenant_name = Column(String, nullable=True)
    tower = Column(String, nullable=True)
    floor = Column(String, nullable=True)
    service_type = Column(String, nullable=False)
    specification = Column(Text, nullable=True)   # JSON string
    quote_amount = Column(Float, nullable=False)
    quote_breakdown = Column(Text, nullable=True)  # JSON string
    approval_status = Column(String, default="pending_approval")
    approved_by = Column(String, nullable=True)
    rejected_by = Column(String, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    vendor_id = Column(Integer, nullable=True)
    scheduled_date = Column(DateTime, nullable=True)
    status = Column(String, default="pending_approval")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
