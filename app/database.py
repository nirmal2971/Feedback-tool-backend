from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# ✅ Get the database URL from environment (Docker ENV or .env file)
DATABASE_URL = os.getenv("DATABASE_URL").strip()
print("🔎 DATABASE_URL =", repr(DATABASE_URL))

# ✅ Fail early if it's missing
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL environment variable is not set.")

# ✅ Add sqlite check only if needed
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# ✅ Create engine and session
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ Base class for models
Base = declarative_base()
