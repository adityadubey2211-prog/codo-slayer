from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from database import Base


# ==========================================
# COMPLAINT
# ==========================================

class Complaint(Base):

    __tablename__ = "complaints"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    location = Column(
        String,
        default=""
    )

    affected = Column(
        Integer,
        default=0
    )

    category = Column(
        String,
        default="General Issue"
    )

    department = Column(
        String,
        default="General Administration"
    )

    priority = Column(
        String,
        default="LOW"
    )

    confidence = Column(
        Integer,
        default=72
    )

    status = Column(
        String,
        default="SUBMITTED"
    )

    created_at = Column(
        DateTime
    )

    updated_at = Column(
        DateTime
    )

    resolved_at = Column(
        DateTime,
        nullable=True
    )

    history = relationship(
        "ComplaintHistory",
        back_populates="complaint",
        cascade="all, delete-orphan",
        order_by="ComplaintHistory.created_at"
    )


# ==========================================
# STATUS HISTORY
# ==========================================

class ComplaintHistory(Base):

    __tablename__ = "complaint_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id"),
        nullable=False
    )

    status = Column(
        String,
        nullable=False
    )

    note = Column(
        String,
        default=""
    )

    created_at = Column(
        DateTime
    )

    complaint = relationship(
        "Complaint",
        back_populates="history"
    )