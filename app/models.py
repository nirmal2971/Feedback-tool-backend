from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum


# ✅ Enum for sentiment
class SentimentEnum(str, enum.Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"

# ✅ User model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)  # ✅ Make sure this line is present
    role = Column(String)  # "manager" or "employee"

# ✅ Feedback model
class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    manager_id = Column(Integer, ForeignKey("users.id"))
    employee_id = Column(Integer, ForeignKey("users.id"))
    strengths = Column(Text)
    improvements = Column(Text)
    sentiment = Column(Enum(SentimentEnum))
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    
class FeedbackRequest(Base):
    __tablename__ = "feedback_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    manager_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    responded = Column(Boolean, default=False)

    employee = relationship("User", foreign_keys=[employee_id])
    manager = relationship("User", foreign_keys=[manager_id])
   
