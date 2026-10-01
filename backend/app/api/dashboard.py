from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.dependencies import get_account_for_user, get_current_user
from app.db.database import get_db
from app.models.analytics import DailyMetric
from app.models.post import Post, PostMetric
from app.models.user import User

router = APIRouter()


def _period_days(period: str) -> int:
    return {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)


@router.get("/overview")
def overview(
    period: str = Query("30d", pattern="^(7d|30d|90d)$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    account = get_account_for_user(user, db)
    days = _period_days(period)
    end = date.today()
    start = end - timedelta(days=days - 1)
    previous_start = start - timedelta(days=days)
    previous_end = start - timedelta(days=1)

    current = (
        db.query(DailyMetric)
        .filter(
            DailyMetric.account_id == account.id,
            DailyMetric.date.between(start, end),
        )
        .order_by(DailyMetric.date)
        .all()
    )
    previous = (
        db.query(DailyMetric)
        .filter(
            DailyMetric.account_id == account.id,
            DailyMetric.date.between(previous_start, previous_end),
        )
        .order_by(DailyMetric.date)
        .all()
    )

    def total(items, field):
        return sum(getattr(x, field) for x in items)

    def pct_change(current_value, previous_value):
        if not previous_value:
            return 0
        return round(((current_value - previous_value) / previous_value) * 100, 2)

    followers = current[-1].followers if current else account.followers
    previous_followers = previous[-1].followers if previous else followers
    reach = total(current, "reach")
    previous_reach = total(previous, "reach")
    impressions = total(current, "impressions")
    previous_impressions = total(previous, "impressions")
    profile_visits = total(current, "profile_visits")
    previous_profile_visits = total(previous, "profile_visits")
    interactions = total(current, "content_interactions")
    previous_interactions = total(previous, "content_interactions")

    posts = (
        db.query(Post)
        .filter(Post.account_id == account.id, func.date(Post.published_at).between(start, end))
        .all()
    )

    return {
        "account": {
            "username": account.username,
            "display_name": account.display_name,
            "followers": followers,
            "following": account.following,
        },
        "period": {"start": start, "end": end, "days": days},
        "kpis": {
            "followers": followers,
            "followers_change": pct_change(followers, previous_followers),
            "reach": reach,
            "reach_change": pct_change(reach, previous_reach),
            "impressions": impressions,
            "impressions_change": pct_change(impressions, previous_impressions),
            "profile_visits": profile_visits,
            "profile_visits_change": pct_change(profile_visits, previous_profile_visits),
            "content_interactions": interactions,
            "interactions_change": pct_change(interactions, previous_interactions),
            "posts": len(posts),
        },
    }


@router.get("/growth")
def growth(
    period: str = Query("30d", pattern="^(7d|30d|90d)$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    account = get_account_for_user(user, db)
    days = _period_days(period)
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

    return {
        "data": [
            {
                "date": row.date.isoformat(),
                "followers": row.followers,
                "reach": row.reach,
                "impressions": row.impressions,
                "profile_visits": row.profile_visits,
                "website_clicks": row.website_clicks,
                "interactions": row.content_interactions,
            }
            for row in rows
        ]
    }


@router.get("/engagement")
def engagement(
    period: str = Query("30d", pattern="^(7d|30d|90d)$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    account = get_account_for_user(user, db)
    days = _period_days(period)
    end = date.today()
    start = end - timedelta(days=days - 1)

    rows = (
        db.query(Post, PostMetric)
        .join(PostMetric, PostMetric.post_id == Post.id)
        .filter(
            Post.account_id == account.id,
            func.date(Post.published_at).between(start, end),
        )
        .order_by(Post.published_at)
        .all()
    )

    return {
        "data": [
            {
                "post_id": post.id,
                "date": post.published_at.date().isoformat(),
                "type": post.post_type,
                "engagement_rate": metric.engagement_rate,
                "likes": metric.likes,
                "comments": metric.comments,
                "shares": metric.shares,
                "saves": metric.saves,
                "reach": metric.reach,
            }
            for post, metric in rows
        ]
    }
