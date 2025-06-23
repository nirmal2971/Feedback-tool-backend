from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app import models, schemas, database
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

# ✅ Router for authentication
router = APIRouter()

# ✅ OAuth2 token scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ✅ Secret key and algorithm from .env
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

# ✅ Password hashing config
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ✅ Database dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Get current user by decoding JWT token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user

# ✅ Verify password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# ✅ Hash password
def get_password_hash(password):
    return pwd_context.hash(password)

# ✅ Create access token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=30)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ✅ Register user route
@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ✅ Login user route
@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={
            "user_id": user.id,
            "email": user.email,
            "role": user.role
        }
    )    
    return {"access_token": access_token, "token_type": "bearer"}

# ✅ NEW: Get current user route (/me)
@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user