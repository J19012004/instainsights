from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class InstagramAccount(Base):
    __tablename__ = "instagram_accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(150))
    bio: Mapped[str] = mapped_column(Text, default="")
    profile_image_url: Mapped[str] = mapped_column(String(500), default="")
    followers: Mapped[int] = mapped_column(Integer, default=0)
    following: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="accounts")
    posts = relationship("Post", back_populates="account", cascade="all, delete-orphan")
    daily_metrics = relationship("DailyMetric", back_populates="account", cascade="all, delete-orphan")
    demographics = relationship("AudienceDemographic", back_populates="account", cascade="all, delete-orphan")
    locations = relationship("AudienceLocation", back_populates="account", cascade="all, delete-orphan")
    activity = relationship("AudienceActivity", back_populates="account", cascade="all, delete-orphan")
    competitors = relationship("Competitor", back_populates="account", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="account", cascade="all, delete-orphan")
