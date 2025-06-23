# Use official Python image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy dependency file first
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Set environment variable for database
ENV DATABASE_URL=sqlite:///./test.db

# Run FastAPI app (correctly points to app.mains)
CMD ["uvicorn", "app.mains:app", "--host", "0.0.0.0", "--port", "8000"]
