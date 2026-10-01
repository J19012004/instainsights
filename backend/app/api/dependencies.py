from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception
        user = db.get(User, int(user_id))
    except (JWTError, ValueError):
        raise credentials_exception

    if not user:
        raise credentials_exception

    return user


def get_account_for_user(user: User, db: Session):
    account = (
        db.query(__import__("app.models.account", fromlist=["InstagramAccount"]).InstagramAccount)
        .filter_by(user_id=user.id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="No Instagram analytics account found.")
    return account
