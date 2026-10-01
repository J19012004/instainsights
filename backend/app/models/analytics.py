from datetime import date, datetime, timezone
from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class DailyMetric(Base):
    __tablename__ = "daily_metrics"
    __table_args__ = (UniqueConstraint("account_id", "date", name="uq_daily_account_date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("instagram_accounts.id", ondelete="CASCADE"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    followers: Mapped[int] = mapped_column(Integer)
    following: Mapped[int] = mapped_column(Integer)
    reach: Mapped[int] = mapped_column(Integer)
    impressions: Mapped[int] = mapped_column(Integer)
    profile_visits: Mapped[int] = mapped_column(Integer)
    website_clicks: Mapped[int] = mapped_column(Integer)
    content_interactions: Mapped[int] = mapped_column(Integer)

    account = relationship("InstagramAccount", back_populates="daily_metrics")


class AudienceDemographic(Base):
    __tablename__ = "audience_demographics"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("instagram_accounts.id", ondelete="CASCADE"), index=True)
    category: Mapped[str] = mapped_column(String(30))
    value: Mapped[str] = mapped_column(String(80))
    percentage: Mapped[float] = mapped_column(Float)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    account = relationship("InstagramAccount", back_populates="demographics")


class AudienceLocation(Base):
    __tablename__ = "audience_locations"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("instagram_accounts.id", ondelete="CASCADE"), index=True)
    location_type: Mapped[str] = mapped_column(String(30))
    location_name: Mapped[str] = mapped_column(String(100))
    percentage: Mapped[float] = mapped_column(Float)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    account = relationship("InstagramAccount", back_populates="locations")


class AudienceActivity(Base):
    __tablename__ = "audience_activity"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("instagram_accounts.id", ondelete="CASCADE"), index=True)
    day_of_week: Mapped[int] = mapped_column(Integer)
    hour: Mapped[int] = mapped_column(Integer)
    active_users: Mapped[int] = mapped_column(Integer)
    activity_score: Mapped[float] = mapped_column(Float)

    account = relationship("InstagramAccount", back_populates="activity")
