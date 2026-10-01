from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_account_for_user, get_current_user
from app.db.database import get_db
from app.models.analytics import AudienceActivity, AudienceDemographic, AudienceLocation
from app.models.user import User

router = APIRouter()


@router.get("")
def audience(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    account = get_account_for_user(user, db)

    demographics = db.query(AudienceDemographic).filter_by(account_id=account.id).all()
    locations = db.query(AudienceLocation).filter_by(account_id=account.id).all()
    activity = (
        db.query(AudienceActivity)
        .filter_by(account_id=account.id)
        .order_by(AudienceActivity.day_of_week, AudienceActivity.hour)
        .all()
    )

    return {
        "demographics": [
            {"category": x.category, "value": x.value, "percentage": x.percentage}
            for x in demographics
        ],
        "locations": [
            {
                "type": x.location_type,
                "name": x.location_name,
                "percentage": x.percentage,
            }
            for x in locations
        ],
        "activity_heatmap": [
            {
                "day": x.day_of_week,
                "hour": x.hour,
                "active_users": x.active_users,
                "activity_score": x.activity_score,
            }
            for x in activity
        ],
    }
