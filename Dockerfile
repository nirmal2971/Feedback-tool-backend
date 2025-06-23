# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements.txt from project root
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code (inside app/) into container
COPY app/ .

# Expose FastAPI port
EXPOSE 8000

# Default database (change on Render dashboard if needed)
ENV DATABASE_URL="sqlite:///./test.db"

# Start the FastAPI server
CMD ["uvicorn", "mains:app", "--host", "0.0.0.0", "--port", "8000"]
