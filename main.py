from fastapi import (
    FastAPI,
    Depends,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from sqlalchemy.orm import Session

from sqlalchemy import func

from database import (
    SessionLocal,
    engine
)

from models import (
    Base,
    Complaint,
    ComplaintHistory
)

from ai_engine import analyze_complaint

from datetime import datetime



# ==========================================
# APP
# ==========================================

app = FastAPI(
    title="Codo Slayer - Smart Grievance API",
    version="2.0"
)


# ==========================================
# DATABASE
# ==========================================

Base.metadata.create_all(
    bind=engine
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)



# ==========================================
# DATABASE SESSION
# ==========================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# ==========================================
# REQUEST MODELS
# ==========================================

class ComplaintRequest(BaseModel):

    title: str

    description: str

    location: str = ""

    affected: int = 0


class StatusRequest(BaseModel):

    status: str

    note: str = ""




# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {

        "message": "Codo Slayer Backend is running",

        "version": "2.0"

    }



# ==========================================
# AI ANALYSIS
# ==========================================

@app.post("/complaints/analyze")
def analyze(
    request: ComplaintRequest
):

    result = analyze_complaint(

        request.title,

        request.description,

        request.affected

    )


    return {

        "success": True,

        "analysis": result

    }


# ==========================================
# CREATE COMPLAINT
# ==========================================

@app.post("/complaints")
def create_complaint(

    request: ComplaintRequest,

    db: Session = Depends(get_db)

):

    result = analyze_complaint(

        request.title,

        request.description,

        request.affected

    )


    # Get latest ID number

    latest = (

        db.query(Complaint)

        .order_by(
            Complaint.id.desc()
        )

        .first()

    )


    if latest is None:

        next_number = 1

    else:

        next_number = latest.id + 1


    complaint_id = (

        f"GRV-2026-{next_number:03d}"

    )


    now = datetime.now()


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

        status="SUBMITTED",

        created_at=now,

        updated_at=now

    )


    db.add(complaint)

    db.commit()

    db.refresh(complaint)


    # ======================================
    # FIRST HISTORY ENTRY
    # ======================================

    history = ComplaintHistory(

        complaint_id=complaint.id,

        status="SUBMITTED",

        note="Complaint submitted",

        created_at=now

    )


    db.add(history)

    db.commit()


    return {

        "success": True,

        "message": "Complaint submitted successfully",

        "complaint": {

            "id": complaint.complaint_id,

            "title": complaint.title,

            "description": complaint.description,

            "location": complaint.location,

            "affected": complaint.affected,

            "category": complaint.category,

            "department": complaint.department,

            "priority": complaint.priority,

            "confidence": complaint.confidence,

            "status": complaint.status,

            "created_at": complaint.created_at

        }

    }


# ==========================================
# GET ALL COMPLAINTS
# ==========================================

@app.get("/complaints")
def get_complaints(

    db: Session = Depends(get_db)

):

    complaints = (

        db.query(Complaint)

        .order_by(

            Complaint.id.desc()

        )

        .all()

    )


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

            "status": complaint.status,

            "created_at": complaint.created_at,

            "updated_at": complaint.updated_at,

            "resolved_at": complaint.resolved_at

        })


    return {

        "success": True,

        "complaints": result

    }


# ==========================================
# GET SINGLE COMPLAINT
# ==========================================

@app.get("/complaints/{complaint_id}")
def get_single_complaint(

    complaint_id: str,

    db: Session = Depends(get_db)

):

    complaint = (

        db.query(Complaint)

        .filter(

            Complaint.complaint_id
            == complaint_id

        )

        .first()

    )


    if complaint is None:

        raise HTTPException(

            status_code=404,

            detail="Complaint not found"

        )


    history = []


    for item in complaint.history:

        history.append({

            "status": item.status,

            "note": item.note,

            "created_at": item.created_at

        })


    return {

        "success": True,

        "complaint": {

            "id": complaint.complaint_id,

            "title": complaint.title,

            "description": complaint.description,

            "location": complaint.location,

            "affected": complaint.affected,

            "category": complaint.category,

            "department": complaint.department,

            "priority": complaint.priority,

            "confidence": complaint.confidence,

            "status": complaint.status,

            "created_at": complaint.created_at,

            "updated_at": complaint.updated_at,

            "resolved_at": complaint.resolved_at,

            "history": history

        }

    }


# ==========================================
# UPDATE STATUS
# ==========================================

@app.put("/complaints/{complaint_id}/status")
def update_status(

    complaint_id: str,

    request: StatusRequest,

    db: Session = Depends(get_db)

):

    allowed_statuses = [

        "SUBMITTED",

        "VERIFIED",

        "IN_PROGRESS",

        "RESOLVED",

        "CLOSED"

    ]


    if request.status not in allowed_statuses:

        raise HTTPException(

            status_code=400,

            detail="Invalid complaint status"

        )


    complaint = (

        db.query(Complaint)

        .filter(

            Complaint.complaint_id
            == complaint_id

        )

        .first()

    )


    if complaint is None:

        raise HTTPException(

            status_code=404,

            detail="Complaint not found"

        )


    now = datetime.now()


    complaint.status = request.status

    complaint.updated_at = now


    if request.status == "RESOLVED":

        complaint.resolved_at = now


    if request.status == "CLOSED":

        if complaint.resolved_at is None:

            complaint.resolved_at = now


    history = ComplaintHistory(

        complaint_id=complaint.id,

        status=request.status,

        note=request.note
        or
        f"Status changed to {request.status}",

        created_at=now

    )


    db.add(history)

    db.commit()

    db.refresh(complaint)


    return {

        "success": True,

        "message": "Complaint status updated successfully",

        "complaint": {

            "id": complaint.complaint_id,

            "status": complaint.status

        }

    }


# ==========================================
# ANALYTICS
# ==========================================

@app.get("/analytics")
def analytics(

    db: Session = Depends(get_db)

):

    total = db.query(
        Complaint
    ).count()


    submitted = db.query(
        Complaint
    ).filter(
        Complaint.status == "SUBMITTED"
    ).count()


    verified = db.query(
        Complaint
    ).filter(
        Complaint.status == "VERIFIED"
    ).count()


    in_progress = db.query(
        Complaint
    ).filter(
        Complaint.status == "IN_PROGRESS"
    ).count()


    resolved = db.query(
        Complaint
    ).filter(
        Complaint.status == "RESOLVED"
    ).count()


    closed = db.query(
        Complaint
    ).filter(
        Complaint.status == "CLOSED"
    ).count()


    critical = db.query(
        Complaint
    ).filter(
        Complaint.priority == "CRITICAL"
    ).count()


    high = db.query(
        Complaint
    ).filter(
        Complaint.priority == "HIGH"
    ).count()


    medium = db.query(
        Complaint
    ).filter(
        Complaint.priority == "MEDIUM"
    ).count()


    low = db.query(
        Complaint
    ).filter(
        Complaint.priority == "LOW"
    ).count()


    categories = (

        db.query(

            Complaint.category,

            func.count(Complaint.id)

        )

        .group_by(
            Complaint.category
        )

        .all()

    )


    departments = (

        db.query(

            Complaint.department,

            func.count(Complaint.id)

        )

        .group_by(
            Complaint.department
        )

        .all()

    )


    resolution_rate = 0


    if total > 0:

        resolution_rate = round(

            (
                (resolved + closed)
                / total
            ) * 100,

            1

        )


    # ======================================
    # AVERAGE RESOLUTION TIME
    # ======================================

    resolved_complaints = (

        db.query(Complaint)

        .filter(
            Complaint.resolved_at
            != None
        )

        .all()

    )


    average_resolution_hours = 0


    if len(resolved_complaints) > 0:

        total_hours = 0


        for complaint in resolved_complaints:

            difference = (

                complaint.resolved_at
                - complaint.created_at

            )


            total_hours += (

                difference.total_seconds()
                / 3600

            )


        average_resolution_hours = round(

            total_hours
            / len(resolved_complaints),

            2

        )


    return {

        "success": True,

        "total": total,

        "status": {

            "SUBMITTED": submitted,

            "VERIFIED": verified,

            "IN_PROGRESS": in_progress,

            "RESOLVED": resolved,

            "CLOSED": closed

        },

        "priority": {

            "CRITICAL": critical,

            "HIGH": high,

            "MEDIUM": medium,

            "LOW": low

        },

        "resolution_rate": resolution_rate,

        "average_resolution_hours":
            average_resolution_hours,

        "categories": {

            category: count

            for category, count in categories

        },

        "departments": {

            department: count

            for department, count in departments

        }

    }