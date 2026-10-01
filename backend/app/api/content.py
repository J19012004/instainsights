from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_account_for_user, get_current_user
from app.db.database import get_db
from app.models.post import Post, PostMetric
from app.models.user import User

router = APIRouter()


def post_json(post: Post):
    metric = post.metrics[-1] if post.metrics else None
    return {
        "id": post.id,
        "instagram_post_id": post.instagram_post_id,
        "type": post.post_type,
        "caption": post.caption,
        "thumbnail_url": post.thumbnail_url,
        "published_at": post.published_at.isoformat(),
        "metrics": None if not metric else {
            "likes": metric.likes,
            "comments": metric.comments,
            "shares": metric.shares,
            "saves": metric.saves,
            "reach": metric.reach,
            "impressions": metric.impressions,
            "video_views": metric.video_views,
            "engagement_rate": metric.engagement_rate,
        },
    }


@router.get("")
def list_content(
    post_type: str | None = Query(None),
    search: str | None = Query(None),
    sort: str = Query("published_at"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    account = get_account_for_user(user, db)
    query = db.query(Post).filter(Post.account_id == account.id)

    if post_type:
        query = query.filter(Post.post_type == post_type)

    if search:
        query = query.filter(Post.caption.ilike(f"%{search}%"))

    posts = query.all()

    def metric_value(post, field):
        return getattr(post.metrics[-1], field, 0) if post.metrics else 0

    if sort in {"reach", "likes", "comments", "shares", "saves", "engagement_rate"}:
        posts.sort(key=lambda p: metric_value(p, sort), reverse=True)
    else:
        posts.sort(key=lambda p: p.published_at, reverse=True)

    total = len(posts)
    start = (page - 1) * page_size
    items = posts[start:start + page_size]

    return {
        "items": [post_json(p) for p in items],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "pages": (total + page_size - 1) // page_size,
        },
    }


@router.get("/{post_id}")
def content_detail(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    account = get_account_for_user(user, db)
    post = (
        db.query(Post)
        .filter(Post.id == post_id, Post.account_id == account.id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found.")

    return post_json(post)
