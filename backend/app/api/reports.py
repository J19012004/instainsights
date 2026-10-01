import csv
import io
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_account_for_user, get_current_user
from app.db.database import get_db
from app.models.analytics import DailyMetric
from app.models.user import User

router = APIRouter()


@router.get("/export.csv")
def export_csv(
    days: int = 30,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    days = max(7, min(days, 365))
    account = get_account_for_user(user, db)
    end = date.today()
    start = end - timedelta(days=days - 1)

    rows = (
        db.query(DailyMetric)
        .filter(
            DailyMetric.account_id == account.id,
            DailyMetric.date.between(start, end),
        )
        .order_by(DailyMetric.date)
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "date", "followers", "following", "reach", "impressions",
        "profile_visits", "website_clicks", "content_interactions"
    ])

    for row in rows:
        writer.writerow([
            row.date.isoformat(),
            row.followers,
            row.following,
            row.reach,
            row.impressions,
            row.profile_visits,
            row.website_clicks,
            row.content_interactions,
        ])

    output.seek(0)
    filename = f"instainsights_{start}_{end}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
