from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Team, Roster
from app.schemas import TeamOut, TeamRoster, RosterOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.get("")
def list_teams(db: Session = Depends(get_db)):
    """Public — list all teams with owner names for the homie picker."""
    teams = db.query(Team).order_by(Team.name).all()
    return [
        {
            "id": str(t.id),
            "name": t.name,
            "abbreviation": t.abbreviation,
            "owner_name": t.owner.display_name if t.owner else None,
        }
        for t in teams
    ]


@router.get("/mine")
def get_my_team(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    team = db.query(Team).filter(Team.user_id == user.id).first()
    if not team:
        raise HTTPException(404, "No team found")
    return TeamOut.model_validate(team)


@router.get("/mine/roster")
def get_my_roster(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    team = db.query(Team).filter(Team.user_id == user.id).first()
    if not team:
        raise HTTPException(404, "No team found")
    roster = db.query(Roster).filter(Roster.team_id == team.id).first()
    return TeamRoster(
        **TeamOut.model_validate(team).model_dump(),
        roster=RosterOut.model_validate(roster) if roster else None,
    )
