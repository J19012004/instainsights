from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import Base, engine

# Import models so SQLAlchemy registers all tables
from app.models import (
    user,
    account,
    post,
    analytics,
    competitor,
    report,
)

from app.api.router import api_router


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",

        # Render production frontend
        "https://instainsights-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROUTES
# =========================================================

app.include_router(
    api_router,
    prefix="/api",
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "status": "running",
        "docs": "/docs",
    }