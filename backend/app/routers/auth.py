from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, VerifyRequest, UserOut

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me")
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if not user:
        raise HTTPException(401, "Not authenticated")
    return UserOut.model_validate(user)


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    settings = get_settings()
    allowed = settings.allowed_email_list
    if allowed and req.email not in allowed:
        raise HTTPException(403, "Email not allowed")

    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        user = User(email=req.email, display_name=req.email.split("@")[0])
        db.add(user)
        db.commit()

    return {"ok": True, "message": "Code sent to email"}


@router.post("/verify")
def verify(req: VerifyRequest, db: Session = Depends(get_db)):
    from app.config import get_settings

    if len(req.code) != 4:
        raise HTTPException(400, "Invalid code")

    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(404, "User not found")

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    return {"ok": True, "user": UserOut.model_validate(user)}
