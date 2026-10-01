from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Competitor(Base):
    __tablename__ = "competitors"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("instagram_accounts.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    username: Mapped[str] = mapped_column(String(100))
    profile_image_url: Mapped[str] = mapped_column(String(500), default="")

    account = relationship("InstagramAccount", back_populates="competitors")
    metrics = relationship("CompetitorMetric", back_populates="competitor", cascade="all, delete-orphan")


class CompetitorMetric(Base):
    __tablename__ = "competitor_metrics"

    id: Mapped[int] = mapped_column(primary_key=True)
    competitor_id: Mapped[int] = mapped_column(ForeignKey("competitors.id", ondelete="CASCADE"), index=True)
    followers: Mapped[int] = mapped_column(Integer)
    engagement_rate: Mapped[float] = mapped_column(Float)
    average_reach: Mapped[int] = mapped_column(Integer)
    posts_per_month: Mapped[int] = mapped_column(Integer)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    competitor = relationship("Competitor", back_populates="metrics")
