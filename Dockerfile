# Use official Python image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy dependency file from root
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code (inside app/) into container's /app folder
COPY app/ .

# Expose FastAPI port (required for Render)
EXPOSE 8000

# Environment variable for DB (optional for SQLite)
ENV DATABASE_URL=sqlite:///./test.db

# Run FastAPI app from mains.py inside /app folder
CMD ["uvicorn", "mains:app", "--host", "0.0.]()
