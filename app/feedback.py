from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from . import schemas, models, database
from .auth import get_current_user
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
from .models import User  # ✅ Needed for type annotation in acknowledge_feedback

from collections import Counter  # 👈 required for dashboard

load_dotenv()

router = APIRouter()


# 🔐 Get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 📝 Create feedback (manager only)
@router.post("/feedbacks", response_model=schemas.FeedbackOut)
def create_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can submit feedback")

    new_feedback = models.Feedback(
        manager_id=current_user.id,
        employee_id=feedback.employee_id,
        strengths=feedback.strengths,
        improvements=feedback.improvements,
        sentiment=feedback.sentiment,
    )
    db.add(new_feedback)
    db.flush()  # ✅ flush before deletion

    # 🧹 Try deleting feedback request related to this
    try:
        request = (
            db.query(models.FeedbackRequest)
            .filter_by(manager_id=current_user.id, employee_id=feedback.employee_id)
            .first()
        )
        if request:
            db.delete(request)
    except Exception as e:
        print("⚠️ Failed to delete feedback request:", e)

    db.commit()
    db.refresh(new_feedback)  # ✅ refresh after commit
    return new_feedback


# 📜 View feedbacks for employee (employee only)
@router.get("/my-feedback", response_model=List[schemas.FeedbackOut])
def get_my_feedbacks(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=403, detail="Only employees can view their feedback"
        )

    return (
        db.query(models.Feedback)
        .filter(models.Feedback.employee_id == current_user.id)
        .order_by(models.Feedback.created_at.desc())
        .all()
    )


# 👁 Acknowledge feedback (employee)
@router.put("/feedbacks/{feedback_id}/acknowledge")
def acknowledge_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    
):
    feedback = (
        db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    )

    if not feedback or feedback.employee_id != current_user.id:
        raise HTTPException(status_code=404, detail="Feedback not found or not yours")

    feedback.acknowledged = True
    db.commit()
    return {"detail": "Feedback acknowledged"}



# 🛠 Manager edits feedback
@router.put("/feedbacks/{feedback_id}", response_model=schemas.FeedbackOut)
def update_feedback(
    feedback_id: int,
    update_data: schemas.FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    feedback = (
        db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    )

    if not feedback or feedback.manager_id != current_user.id:
        raise HTTPException(
            status_code=404, detail="Feedback not found or not yours to edit"
        )

    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(feedback, key, value)

    db.commit()
    db.refresh(feedback)
    return feedback


# ✅ Manager Dashboard
@router.get("/dashboard/manager")
def manager_dashboard(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(
            status_code=403, detail="Only managers can access this dashboard"
        )

    feedbacks = (
        db.query(models.Feedback)
        .filter(models.Feedback.manager_id == current_user.id)
        .all()
    )
    total = len(feedbacks)
    sentiments = [f.sentiment.value for f in feedbacks]
    sentiment_counts = dict(Counter(sentiments))

    return {
        "total_feedback_given": total,
        "sentiment_summary": sentiment_counts,
        "feedbacks": feedbacks,
    }


# ✅ Employee Dashboard
@router.get("/dashboard/employee", response_model=List[schemas.FeedbackOut])
def employee_dashboard(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=403, detail="Only employees can access this dashboard"
        )

    return (
        db.query(models.Feedback)
        .filter(models.Feedback.employee_id == current_user.id)
        .order_by(models.Feedback.created_at.desc())
        .all()
    )


# ✅ Feedback get


@router.get("/users/employees", response_model=List[schemas.UserResponse])
def list_employees(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(
            status_code=403, detail="Only managers can access employee list"
        )
    return db.query(models.User).filter(models.User.role == "employee").all()


@router.get("/given-feedbacks", response_model=List[schemas.FeedbackOut])
def get_given_feedbacks(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(
            status_code=403, detail="Only managers can view given feedback"
        )
    return (
        db.query(models.Feedback)
        .filter(models.Feedback.manager_id == current_user.id)
        .order_by(models.Feedback.created_at.desc())
        .all()
    )



@router.get("/users/managers", response_model=List[schemas.UserResponse])
def list_managers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "employee":
        raise HTTPException(
            status_code=403, detail="Only employees can request feedback from managers"
        )
    return db.query(models.User).filter(models.User.role == "manager").all()


@router.post("/feedback-requests", response_model=schemas.FeedbackRequestOut)
def request_feedback(
    request: schemas.FeedbackRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can request feedback")

    new_request = models.FeedbackRequest(
        employee_id=current_user.id,
        manager_id=request.manager_id,
        message=request.message,
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


@router.get("/feedback-requests", response_model=List[schemas.FeedbackRequestOut])
def get_feedback_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view feedback requests")

    return db.query(models.FeedbackRequest).filter_by(manager_id=current_user.id).all()
