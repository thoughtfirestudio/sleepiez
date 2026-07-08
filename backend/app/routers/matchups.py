from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Matchup, Team
from app.schemas import MatchupOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/matchups", tags=["matchups"])


@router.get("/current")
def get_current_matchup(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    team = db.query(Team).filter(Team.user_id == user.id).first()
    if not team:
        raise HTTPException(404, "No team found")

    matchup = db.query(Matchup).filter(
        ((Matchup.home_team_id == team.id) | (Matchup.away_team_id == team.id)),
        Matchup.is_complete == False,
    ).first()
    if not matchup:
        raise HTTPException(404, "No current matchup")
    return MatchupOut.model_validate(matchup)


@router.get("/history")
def get_matchup_history(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    team = db.query(Team).filter(Team.user_id == user.id).first()
    if not team:
        raise HTTPException(404, "No team found")

    matchups = db.query(Matchup).filter(
        ((Matchup.home_team_id == team.id) | (Matchup.away_team_id == team.id)),
        Matchup.is_complete == True,
    ).order_by(Matchup.week.desc()).all()

    return [MatchupOut.model_validate(m) for m in matchups]


@router.get("/{matchup_id}")
def get_matchup(matchup_id: str, db: Session = Depends(get_db)):
    matchup = db.query(Matchup).filter(Matchup.id == matchup_id).first()
    if not matchup:
        raise HTTPException(404, "Matchup not found")
    return MatchupOut.model_validate(matchup)
