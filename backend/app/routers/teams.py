from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Team, Roster, User
from app.schemas import TeamOut, TeamRoster, RosterOut

router = APIRouter(prefix="/api/teams", tags=["teams"])


def _get_my_team(db: Session) -> Team:
    user = db.query(User).first()
    if not user:
        raise HTTPException(401, "Not authenticated")
    team = db.query(Team).filter(Team.user_id == user.id).first()
    if not team:
        raise HTTPException(404, "No team found")
    return team


@router.get("/mine")
def get_my_team(db: Session = Depends(get_db)):
    team = _get_my_team(db)
    return TeamOut.model_validate(team)


@router.get("/mine/roster")
def get_my_roster(db: Session = Depends(get_db)):
    team = _get_my_team(db)
    roster = db.query(Roster).filter(Roster.team_id == team.id).first()
    return TeamRoster(
        **TeamOut.model_validate(team).model_dump(),
        roster=RosterOut.model_validate(roster) if roster else None,
    )
