# InstaInsights Backend

FastAPI + PostgreSQL backend for the InstaInsights Instagram analytics dashboard.

## Architecture

React/Vite frontend
        |
        | HTTP/JSON
        v
FastAPI REST API
        |
        | SQLAlchemy + psycopg
        v
PostgreSQL

## Setup

1. Create a PostgreSQL database named `instagram_analytics`.
2. Copy `.env.example` to `.env`.
3. Put your PostgreSQL password in `.env`.
4. Activate the virtual environment.
5. Install requirements:

```cmd
pip install -r requirements.txt
```

6. Seed demo data:

```cmd
python seed.py
```

7. Start the API:

```cmd
python -m uvicorn app.main:app --reload
```

8. Open:

- http://127.0.0.1:8000/docs
- http://127.0.0.1:8000/api/health

## Demo login

Email: `demo@instainsights.local`
Password: `Demo@12345`

The Instagram data is demonstration data. It is stored in PostgreSQL and served through the API; it is not connected to a real Instagram account.

## Main endpoints

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- GET `/api/dashboard/overview`
- GET `/api/dashboard/growth`
- GET `/api/dashboard/engagement`
- GET `/api/content`
- GET `/api/content/{post_id}`
- GET `/api/audience`
- GET `/api/insights`
- GET `/api/competitors`
- GET `/api/reports/export.csv`
- GET `/api/health`
