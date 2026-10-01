from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.content import router as content_router
from app.api.audience import router as audience_router
from app.api.insights import router as insights_router
from app.api.competitors import router as competitors_router
from app.api.reports import router as reports_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(content_router, prefix="/content", tags=["Content"])
api_router.include_router(audience_router, prefix="/audience", tags=["Audience"])
api_router.include_router(insights_router, prefix="/insights", tags=["Insights"])
api_router.include_router(competitors_router, prefix="/competitors", tags=["Competitors"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
