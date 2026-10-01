import random
from datetime import date, datetime, timedelta, timezone

from app.core.security import hash_password
from app.db.database import Base, SessionLocal, engine
from app.models import (
    AudienceActivity,
    AudienceDemographic,
    AudienceLocation,
    Competitor,
    CompetitorMetric,
    DailyMetric,
    InstagramAccount,
    Post,
    PostMetric,
    User,
)

random.seed(42)

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        # Rebuild demo data safely for local development.
        for model in [
            PostMetric, Post, DailyMetric, AudienceDemographic,
            AudienceLocation, AudienceActivity, CompetitorMetric,
            Competitor, InstagramAccount, User
        ]:
            db.query(model).delete()
        db.commit()

        user = User(
            name="Demo User",
            email="demo@instainsights.local",
            password_hash=hash_password("Demo@12345"),
        )
        db.add(user)
        db.flush()

        account = InstagramAccount(
            user_id=user.id,
            username="nova_studio",
            display_name="Nova Studio",
            bio="Creator and social media analytics demo account.",
            profile_image_url="https://i.pravatar.cc/200?img=12",
            followers=24821,
            following=842,
        )
        db.add(account)
        db.flush()

        # 180 days of daily metrics so 7/30/90-day dashboard ranges work.
        start = date.today() - timedelta(days=179)
        followers = 18421

        for i in range(180):
            current_date = start + timedelta(days=i)
            growth = random.randint(18, 58)
            if i in (38, 91, 143):
                growth += random.randint(150, 420)
            followers += growth

            reach = random.randint(11000, 29000)
            impressions = int(reach * random.uniform(1.35, 1.8))
            profile_visits = random.randint(250, 900)
            website_clicks = random.randint(40, 220)
            interactions = random.randint(900, 3200)

            db.add(DailyMetric(
                account_id=account.id,
                date=current_date,
                followers=followers,
                following=842 + random.randint(-10, 20),
                reach=reach,
                impressions=impressions,
                profile_visits=profile_visits,
                website_clicks=website_clicks,
                content_interactions=interactions,
            ))

        types = ["reel", "image", "carousel", "story"]
        captions = [
            "5 practical tips for creators",
            "Behind the scenes of our latest project",
            "A simple content strategy that works",
            "What we learned this week",
            "Creator workflow checklist",
            "Design inspiration for your next post",
            "Three mistakes to avoid",
            "Weekly performance recap",
        ]

        for i in range(100):
            published = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 179))
            post_type = random.choices(types, weights=[45, 20, 25, 10])[0]

            multiplier = {
                "reel": 1.55,
                "carousel": 1.20,
                "image": 0.85,
                "story": 0.65,
            }[post_type]

            reach = int(random.randint(7000, 42000) * multiplier)
            likes = int(reach * random.uniform(0.035, 0.10))
            comments = int(likes * random.uniform(0.025, 0.08))
            shares = int(likes * random.uniform(0.04, 0.15))
            saves = int(likes * random.uniform(0.05, 0.18))
            impressions = int(reach * random.uniform(1.25, 1.75))
            video_views = int(reach * random.uniform(0.75, 1.45)) if post_type == "reel" else 0
            engagement_rate = round(
                ((likes + comments + shares + saves) / max(reach, 1)) * 100,
                2,
            )

            post = Post(
                account_id=account.id,
                instagram_post_id=f"demo_post_{i+1:03d}",
                post_type=post_type,
                caption=random.choice(captions),
                thumbnail_url=f"https://picsum.photos/seed/insta{i+1}/600/600",
                published_at=published,
            )
            db.add(post)
            db.flush()

            db.add(PostMetric(
                post_id=post.id,
                likes=likes,
                comments=comments,
                shares=shares,
                saves=saves,
                reach=reach,
                impressions=impressions,
                video_views=video_views,
                engagement_rate=engagement_rate,
            ))

        demographics = [
            ("age", "18-24", 32),
            ("age", "25-34", 41),
            ("age", "35-44", 18),
            ("age", "45-54", 7),
            ("age", "55+", 2),
            ("gender", "Female", 52),
            ("gender", "Male", 44),
            ("gender", "Other", 4),
        ]
        for category, value, percentage in demographics:
            db.add(AudienceDemographic(
                account_id=account.id,
                category=category,
                value=value,
                percentage=percentage,
            ))

        locations = [
            ("country", "India", 48),
            ("country", "United States", 18),
            ("country", "United Kingdom", 9),
            ("country", "UAE", 7),
            ("country", "Canada", 5),
            ("country", "Other", 13),
            ("city", "Bengaluru", 15),
            ("city", "Mumbai", 11),
            ("city", "Delhi", 10),
            ("city", "Chennai", 7),
            ("city", "Hyderabad", 6),
        ]
        for location_type, name, percentage in locations:
            db.add(AudienceLocation(
                account_id=account.id,
                location_type=location_type,
                location_name=name,
                percentage=percentage,
            ))

        for day in range(7):
            for hour in range(24):
                evening_boost = 1.0 + (1.6 if 18 <= hour <= 22 else 0)
                weekday_boost = 1.25 if day in (2, 3, 4) else 1.0
                active = int(random.randint(600, 2800) * evening_boost * weekday_boost)
                db.add(AudienceActivity(
                    account_id=account.id,
                    day_of_week=day,
                    hour=hour,
                    active_users=active,
                    activity_score=round(active / 50, 2),
                ))

        competitors = [
            ("Creator Alpha", "creator_alpha", 31200, 6.8, 15400, 24),
            ("Brand Beta", "brand_beta", 18900, 9.1, 12800, 17),
            ("Studio Gamma", "studio_gamma", 26700, 7.4, 14100, 21),
        ]
        for name, username, followers_c, engagement, avg_reach, posts_month in competitors:
            competitor = Competitor(
                account_id=account.id,
                name=name,
                username=username,
                profile_image_url=f"https://i.pravatar.cc/200?u={username}",
            )
            db.add(competitor)
            db.flush()
            db.add(CompetitorMetric(
                competitor_id=competitor.id,
                followers=followers_c,
                engagement_rate=engagement,
                average_reach=avg_reach,
                posts_per_month=posts_month,
            ))

        db.commit()

        print("Demo database seeded successfully.")
        print("Login email: demo@instainsights.local")
        print("Login password: Demo@12345")
        print("Account: @nova_studio")
        print("Posts: 100")
        print("Daily metrics: 180 days")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
