from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models import SentimentEnum

# ✅ Input data for registering a user
class UserCreate(BaseModel):
    email: str
    password: str
    role: str  # "manager" or "employee"

# ✅ Input data for login
class UserLogin(BaseModel):
    email: str
    password: str

# ✅ Response model after login
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ✅ Return user info after register
class UserResponse(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        orm_mode = True

# ----------------------------------------------------
# ✅ Feedback Schemas (Paste Below This Line)
# ----------------------------------------------------

class FeedbackBase(BaseModel):
    strengths: str
    improvements: str
    sentiment: SentimentEnum

class FeedbackCreate(FeedbackBase):
    employee_id: int  # manager selects which employee

class FeedbackUpdate(BaseModel):
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    sentiment: Optional[SentimentEnum] = None
    acknowledged: Optional[bool] = None

class FeedbackOut(FeedbackBase):
    id: int
    manager_id: int
    employee_id: int
    acknowledged: bool
    created_at: datetime

    class Config:
        orm_mode = True
        
class FeedbackRequestCreate(BaseModel):
    manager_id: int
    message: str

class FeedbackRequestOut(BaseModel):
    id: int
    employee_id: int
    manager_id: int
    message: str
    created_at: datetime
    responded: bool

    class Config:
        orm_mode = True
