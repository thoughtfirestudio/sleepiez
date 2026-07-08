from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import League, Team
from app.schemas import LeagueOut, LeagueStandings, TeamOut, ChaosConfigUpdate

router = APIRouter(prefix="/api/league", tags=["league"])


@router.get("")
def get_league(db: Session = Depends(get_db)):
    league = db.query(League).first()
    if not league:
        raise HTTPException(404, "No league found")
    return LeagueOut.model_validate(league)


@router.get("/standings")
def get_standings(db: Session = Depends(get_db)):
    league = db.query(League).first()
    if not league:
        raise HTTPException(404, "No league found")
    teams = db.query(Team).filter(Team.league_id == league.id)\
        .order_by(Team.wins.desc(), Team.total_points.desc()).all()
    return {
        **LeagueOut.model_validate(league).model_dump(),
        "teams": [TeamOut.model_validate(t) for t in teams],
    }


@router.get("/config")
def get_chaos_config(db: Session = Depends(get_db)):
    league = db.query(League).first()
    if not league:
        raise HTTPException(404, "No league found")
    return league.league_config or {}


@router.patch("/config")
def update_chaos_config(update: ChaosConfigUpdate, db: Session = Depends(get_db)):
    league = db.query(League).first()
    if not league:
        raise HTTPException(404, "No league found")

    config = dict(league.league_config or {})
    for key, value in update.model_dump(exclude_none=True).items():
        config[key] = value

    league.league_config = config
    db.commit()
    return config
