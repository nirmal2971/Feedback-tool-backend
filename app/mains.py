import time
import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import models, database
from app.auth import router as auth_router
from app.feedback import router as feedback_router

# ✅ Add timeout to avoid infinite loop
start_time = time.time()
timeout = 30  # seconds

while True:
    try:
        conn = psycopg2.connect(
            host="db",  # 🔁 If using Render's hosted PostgreSQL, this should be the actual hostname
            database="feedback_db",
            user="postgres",
            password="password"
        )
        conn.close()
        print("✅ Database is ready!")
        break
    except psycopg2.OperationalError:
        if time.time() - start_time > timeout:
            print("❌ Timeout: Database did not become ready.")
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
