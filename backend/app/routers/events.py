from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import UserEvent
from app.routers.auth import get_current_user, COOKIE_NAME

router = APIRouter(prefix="/api/events", tags=["events"])


@router.post("")
def track_event(
    event_type: str,
    event_data: dict = {},
    page_url: str | None = None,
    request: Request = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    session_id = request.cookies.get(COOKIE_NAME) if request else None
    db.add(UserEvent(
        user_id=user.id,
        event_type=event_type,
        event_data=event_data or {},
        page_url=page_url,
        session_id=session_id,
    ))
    db.commit()
    return {"ok": True}


@router.get("/stats")
def get_event_stats(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    total = db.query(func.count(UserEvent.id)).scalar() or 0
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    active_users = (
        db.query(func.count(func.distinct(UserEvent.user_id)))
        .filter(UserEvent.created_at >= week_ago)
        .scalar() or 0
    )

    type_counts = (
        db.query(UserEvent.event_type, func.count(UserEvent.id))
        .group_by(UserEvent.event_type)
        .order_by(func.count(UserEvent.id).desc())
        .limit(20)
        .all()
    )

    daily = (
        db.query(
            func.date_trunc("day", UserEvent.created_at),
            func.count(func.distinct(UserEvent.user_id)),
        )
        .filter(UserEvent.created_at >= week_ago)
        .group_by(func.date_trunc("day", UserEvent.created_at))
        .order_by(func.date_trunc("day", UserEvent.created_at))
        .all()
    )

    return {
        "total_events": total,
        "active_users_7d": active_users,
        "events_by_type": {t: c for t, c in type_counts},
        "daily_active_users": [
            {"date": str(day), "users": count} for day, count in daily
        ],
    }
