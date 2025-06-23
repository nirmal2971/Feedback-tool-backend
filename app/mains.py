from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import models, database
from app.auth import router as auth_router
from app.feedback import router as feedback_router
import psycopg2
import time

# ✅ Wait for PostgreSQL to be ready before creating tables
while True:
    try:
        conn = psycopg2.connect(
            host="db",
            database="feedback_db",
            user="postgres",
            password="password"
        )
        conn.close()
        print("✅ Database is ready!")
        break
    except psycopg2.OperationalError:
        print("⏳ Waiting for the database to start...")
        time.sleep(2)

# ✅ Create database tables
models.Base.metadata.create_all(bind=database.engine)

# ✅ Create FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include the auth routes (register/login)
app.include_router(auth_router)
app.include_router(feedback_router)

@app.get("/")
def root():
    return {"message": "Backend is working"}
