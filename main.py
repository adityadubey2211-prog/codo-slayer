from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import Base, Complaint
from ai_engine import analyze_complaint


app = FastAPI(
    title="JanSeva Smart Grievance API",
    version="1.0"
)


# Create database tables
Base.metadata.create_all(bind=engine)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Database dependency
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# Request model
class ComplaintRequest(BaseModel):

    title: str

    description: str

    location: str = ""

    affected: int = 0


# Test route
@app.get("/")
def home():

    return {
        "message": "JanSeva Backend is running"
    }


# AI analysis route
@app.post("/complaints/analyze")
def analyze(request: ComplaintRequest):

    result = analyze_complaint(
        request.title,
        request.description,
        request.affected
    )

    return {
        "success": True,
        "analysis": result
    }


# Create complaint
@app.post("/complaints")
def create_complaint(
    request: ComplaintRequest,
    db: Session = Depends(get_db)
):

    # AI analysis
    result = analyze_complaint(
        request.title,
        request.description,
        request.affected
    )

    # Generate complaint ID
    count = db.query(Complaint).count() + 1

    complaint_id = f"GRV-2026-{count:03d}"

    # Create complaint
    complaint = Complaint(

        complaint_id=complaint_id,

        title=request.title,

        description=request.description,

        location=request.location,

        affected=request.affected,

        category=result["category"],

        department=result["department"],

        priority=result["priority"],

        confidence=result["confidence"],

        status="SUBMITTED"
    )

    db.add(complaint)

    db.commit()

    db.refresh(complaint)

    return {

        "success": True,

        "message": "Complaint submitted successfully",

        "complaint": {

            "id": complaint.complaint_id,

            "title": complaint.title,

            "category": complaint.category,

            "department": complaint.department,

            "priority": complaint.priority,

            "confidence": complaint.confidence,

            "status": complaint.status

        }
    }


# Get all complaints
@app.get("/complaints")
def get_complaints(
    db: Session = Depends(get_db)
):

    complaints = db.query(Complaint).all()

    result = []

    for complaint in complaints:

        result.append({

            "id": complaint.complaint_id,

            "title": complaint.title,

            "description": complaint.description,

            "location": complaint.location,

            "affected": complaint.affected,

            "category": complaint.category,

            "department": complaint.department,

            "priority": complaint.priority,

            "confidence": complaint.confidence,

            "status": complaint.status
        })

    return {
        "success": True,
        "complaints": result
    }