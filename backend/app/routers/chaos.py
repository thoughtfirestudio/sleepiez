from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import FunMetrics, Announcement
from app.schemas import FunMetricsOut, AnnouncementOut

router = APIRouter(prefix="/api/chaos", tags=["chaos"])


@router.get("/fun-metrics")
def get_fun_metrics(week: int | None = None, db: Session = Depends(get_db)):
    q = db.query(FunMetrics)
    if week:
        q = q.filter(FunMetrics.week == week)
    metrics = q.order_by(FunMetrics.week.desc()).all()
    return [FunMetricsOut.model_validate(m) for m in metrics]


@router.get("/announcements")
def get_announcements(db: Session = Depends(get_db)):
    anns = db.query(Announcement).filter(Announcement.acknowledged == False)\
        .order_by(Announcement.created_at.desc()).limit(20).all()
    return [AnnouncementOut.model_validate(a) for a in anns]


@router.post("/announcements/{ann_id}/acknowledge")
def acknowledge_announcement(ann_id: str, db: Session = Depends(get_db)):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(404, "Announcement not found")
    ann.acknowledged = True
    db.commit()
    return {"ok": True}
