from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine
from app.api.router import api_router

import app.models


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="InstaInsights API",
    version="1.0.0",
    description="InstaInsights Instagram Analytics API",
)


# Allow the React/Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API routes
app.include_router(
    api_router,
    prefix="/api",
)


@app.get("/")
def root():
    return {
        "name": "InstaInsights API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
    }