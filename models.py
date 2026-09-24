from sqlalchemy import Column, Integer, String, Text
from database import Base


class Complaint(Base):

    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    complaint_id = Column(String, unique=True, index=True)

    title = Column(String)

    description = Column(Text)

    location = Column(String)

    affected = Column(Integer)

    category = Column(String)

    department = Column(String)

    priority = Column(String)

    confidence = Column(Integer)

    status = Column(String, default="SUBMITTED")