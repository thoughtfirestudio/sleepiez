import uuid
import secrets
import random
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, AuthCode
from app.schemas import LoginRequest, VerifyRequest, UserOut
from app.config import get_settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

COOKIE_NAME = "sleepiez_token"
SESSION_EXPIRY_DAYS = 30


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Dependency: extract session token from cookie and return user."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(401, "Not authenticated")
    user = db.query(User).filter(User.session_token == token).first()
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user


@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)


@router.post("/login")
def login(req: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Generate a 4-digit code, store it, and return it.
    In production the code would be sent via SES email.
    """
    settings = get_settings()
    allowed = settings.allowed_email_list
    if allowed and req.email not in allowed:
        raise HTTPException(403, "Email not allowed")

    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(404, "No account found for that email")

    # Invalidate old unused codes for this email
    db.query(AuthCode).filter(
        AuthCode.email == req.email,
        AuthCode.used_at.is_(None),
    ).update({"used_at": datetime.now(timezone.utc)})

    # Generate 4-digit code
    code = f"{random.randint(0, 9999):04d}"

    db.add(AuthCode(
        email=req.email,
        code=code,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
    ))
    db.commit()

    print(f"[auth] Login code for {req.email}: {code}")

    # Send via SES if configured, otherwise just log
    from app.email import send_otp_code
    ses_configured = bool(settings.aws_access_key_id and settings.aws_secret_access_key)
    if ses_configured:
        sent = send_otp_code(req.email, code)
        if not sent:
            print(f"[auth] WARNING: Failed to send email to {req.email}")
    else:
        print(f"[auth] SES not configured — code only visible in server logs")

    return {
        "ok": True,
        "message": f"Code sent to {req.email}",
        "debug_code": code if not ses_configured else None,
    }


@router.post("/verify")
def verify(req: VerifyRequest, response: Response, db: Session = Depends(get_db)):
    """Verify the 4-digit code, set a session cookie, return user."""
    if len(req.code) != 4 or not req.code.isdigit():
        raise HTTPException(400, "Invalid code format")

    now = datetime.now(timezone.utc)

    auth_code = db.query(AuthCode).filter(
        AuthCode.email == req.email,
        AuthCode.code == req.code,
        AuthCode.used_at.is_(None),
        AuthCode.expires_at > now,
    ).first()

    if not auth_code:
        raise HTTPException(401, "Invalid or expired code")

    # Mark code as used
    auth_code.used_at = now

    # Find or create user
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(404, "User not found")

    # Generate session token
    user.session_token = secrets.token_hex(32)
    user.last_login_at = now
    db.commit()

    # Set httpOnly cookie
    response.set_cookie(
        key=COOKIE_NAME,
        value=user.session_token,
        max_age=SESSION_EXPIRY_DAYS * 86400,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )

    return {"ok": True, "user": UserOut.model_validate(user)}


@router.post("/logout")
def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    """Clear the session token and cookie."""
    token = request.cookies.get(COOKIE_NAME)
    if token:
        user = db.query(User).filter(User.session_token == token).first()
        if user:
            user.session_token = None
            db.commit()

    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        secure=True,
        samesite="lax",
    )
    return {"ok": True}


@router.post("/dismiss-challenge-prompt")
def dismiss_challenge_prompt(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark the challenge prompt as seen for this user."""
    user.challenge_prompt_seen = True
    db.commit()
    return {"ok": True}
