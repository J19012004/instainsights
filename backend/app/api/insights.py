from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_account_for_user, get_current_user
from app.db.database import get_db
from app.models.post import Post
from app.models.user import User

router = APIRouter()


@router.get("")
def insights(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    account = get_account_for_user(user, db)
    posts = db.query(Post).filter(Post.account_id == account.id).all()

    by_type = {}
    for post in posts:
        metric = post.metrics[-1] if post.metrics else None
        if not metric:
            continue
        bucket = by_type.setdefault(post.post_type, {"reach": 0, "engagement": 0, "count": 0})
        bucket["reach"] += metric.reach
        bucket["engagement"] += metric.engagement_rate
        bucket["count"] += 1

    type_summary = {}
    for post_type, data in by_type.items():
        type_summary[post_type] = {
            "average_reach": round(data["reach"] / data["count"]),
            "average_engagement_rate": round(data["engagement"] / data["count"], 2),
            "posts": data["count"],
        }

    insights_list = []

    if type_summary:
        best_reach_type = max(type_summary, key=lambda k: type_summary[k]["average_reach"])
        best_engagement_type = max(
            type_summary, key=lambda k: type_summary[k]["average_engagement_rate"]
        )
        insights_list.append({
            "type": "content",
            "severity": "info",
            "title": f"{best_reach_type.title()} content has the highest average reach",
            "description": (
                f"{best_reach_type.title()} posts average "
                f"{type_summary[best_reach_type]['average_reach']:,} reach."
            ),
        })
        insights_list.append({
            "type": "engagement",
            "severity": "success",
            "title": f"{best_engagement_type.title()} content leads engagement",
            "description": (
                f"{best_engagement_type.title()} posts average "
                f"{type_summary[best_engagement_type]['average_engagement_rate']:.2f}% engagement."
            ),
        })

    insights_list.append({
        "type": "data",
        "severity": "info",
        "title": "Demo analytics data is connected to PostgreSQL",
        "description": "These insights are calculated from the stored analytics records, not hardcoded in the React frontend.",
    })

    return {
        "generated_by": "rule_based_analytics",
        "insights": insights_list,
        "content_type_summary": type_summary,
    }
