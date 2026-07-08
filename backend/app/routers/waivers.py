from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import WaiverClaim, Team
from app.schemas import WaiverClaimOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/waivers", tags=["waivers"])


@router.get("")
def list_waivers(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    team = db.query(Team).filter(Team.user_id == user.id).first()
    if not team:
        raise HTTPException(404, "No team found")

    claims = db.query(WaiverClaim).filter(
        WaiverClaim.team_id == team.id,
        WaiverClaim.status == "pending",
    ).order_by(WaiverClaim.created_at.desc()).all()

    return [WaiverClaimOut.model_validate(c) for c in claims]
