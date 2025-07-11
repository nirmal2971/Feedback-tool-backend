# Use official Python image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy requirement file from root
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything from root to container /app
COPY . .

# Expose FastAPI default port
EXPOSE 8000



# Start FastAPI from app/mains.py
CMD ["sh", "-c", "uvicorn app.mains:app --host 0.0.0.0 --port ${PORT:-8000}"]
