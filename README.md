
# 🗣️ Internal Feedback Tool

A full-stack internal feedback management tool designed for organizations. This system enables managers to provide constructive feedback to employees, and employees to view, acknowledge, and even request feedback. It supports dashboards, role-based access, sentiment analysis, and PDF export.

---

## 🚀 Live Demo

- 🔗 **Frontend**: [https://feedback-tool-backend.vercel.app](https://feedback-tool-backend.vercel.app)
- 🔗 **Backend API**: [https://feedback-tool-backend-b2y7.onrender.com](https://feedback-tool-backend-b2y7.onrender.com)

> ⚠️ You must register and log in to access the dashboard. Roles are assigned based on registration.

---


## 📦 Features

### 👨‍💼 Manager Role
- ✅ Create and edit feedback for employees
- 📊 View a dashboard with:
  - Feedback count
  - Sentiment trends (pie chart)
  - Pending feedback requests
- 🧾 Export given feedback history as PDF

### 👩‍💻 Employee Role
- 👁 View all received feedback
- 🙋‍♂️ Acknowledge feedback
- 📨 Request feedback from managers
- 🕒 View feedback timeline in a clean dashboard
- 🧾 Export received feedback as PDF

### 🔐 Common
- JWT-based secure login
- Role-based access control (Manager / Employee)
- Clean UI with Material UI
- React Router for route protection
- Framer Motion animations
- Optimistic UI updates and feedback via snackbars
- Dockerized backend with FastAPI

---

## 💻 Tech Stack

### Backend
- Python 3.11
- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- JWT Authentication
- Docker

### Frontend
- React (Create React App)
- Material UI
- Framer Motion
- Axios for API communication
- `jwt-decode` for extracting role & ID

---

## 🚀 Getting Started

### 📂 Clone the repository

```bash
git clone https://github.com/nirmal2971/Feedback-tool-backend.git
cd Feedback-tool-backend
```

---

### 🔧 Backend Setup (FastAPI + PostgreSQL)

#### 🚀 Option 1: Run with Docker

```bash
docker build -t feedback-backend .
docker run -d -p 8000:8000 feedback-backend
```

> 📌 **Note:** Default database is **SQLite** (for demo/testing).  
> To use **PostgreSQL**, update `DATABASE_URL` in `mains.py` or use a `.env` file.

---

#### 💻 Option 2: Run Locally (Without Docker)

```bash
cd app
python -m venv venv

# For Windows:
venv\Scripts\activate

# For macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn mains:app --reload
```

---

### 🌐 Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

---

## 🐳 Dockerfile

Located in `feedback-tool-backend/app/Dockerfile`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "mains:app", "--host", "0.0.0.0", "--port", "8000"]
```
