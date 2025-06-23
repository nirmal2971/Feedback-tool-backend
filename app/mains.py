import time
import psycopg2
import os
from urllib.parse import urlparse

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import models, database
from app.auth import router as auth_router
from app.feedback import router as feedback_router

# ✅ Load DB URL from env
db_url = os.getenv("DATABASE_URL")
parsed = urlparse(db_url)

start_time = time.time()
timeout = 30  # seconds

while True:
    try:
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path[1:],  # removes leading slash
            user=parsed.username,
            password=parsed.password
        )
        conn.close()
        print("✅ Database is ready!")
        break
    except psycopg2.OperationalError as e:
        if time.time() - start_time > timeout:
            print("❌ Timeout: Database did not become ready.")
            print("Error:", e)
            raise SystemExit("Database not available")
        print("⏳ Waiting for the database to start...")
        time.sleep(2)

# ✅ Create tables after DB is ready
models.Base.metadata.create_all(bind=database.engine)

# ✅ FastAPI app init
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include routers
app.include_router(auth_router)
app.include_router(feedback_router)

@app.get("/")
def root():
    return {"message": "Backend is working"}
