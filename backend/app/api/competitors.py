from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_account_for_user, get_current_user
from app.db.database import get_db
from app.models.competitor import Competitor
from app.models.user import User

router = APIRouter()


@router.get("")
def competitors(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    account = get_account_for_user(user, db)
    rows = db.query(Competitor).filter_by(account_id=account.id).all()

    result = []
    own_metric = None
    for competitor in rows:
        metric = competitor.metrics[-1] if competitor.metrics else None
        result.append({
            "id": competitor.id,
            "name": competitor.name,
            "username": competitor.username,
            "profile_image_url": competitor.profile_image_url,
            "metrics": None if not metric else {
                "followers": metric.followers,
                "engagement_rate": metric.engagement_rate,
                "average_reach": metric.average_reach,
                "posts_per_month": metric.posts_per_month,
            },
            "demo_data": True,
        })

    return {
        "account": {
            "username": account.username,
            "followers": account.followers,
        },
        "competitors": result,
        "notice": "Benchmark accounts are demo/sample data and are not connected to real Instagram accounts.",
    }
