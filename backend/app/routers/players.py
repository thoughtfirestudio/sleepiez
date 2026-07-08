from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import Player
from app.schemas import PlayerOut

router = APIRouter(prefix="/api/players", tags=["players"])


@router.get("")
def list_players(
    position: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Player)
    if position:
        q = q.filter(Player.position == position.upper())
    if status:
        q = q.filter(Player.injury_status == status)
    if search:
        like = f"%{search}%"
        q = q.filter(Player.first_name.ilike(like) | Player.last_name.ilike(like))
    players = q.order_by(Player.last_name, Player.first_name).limit(100).all()
    return [PlayerOut.model_validate(p) for p in players]


@router.get("/{player_id}")
def get_player(player_id: str, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        from fastapi import HTTPException
        raise HTTPException(404, "Player not found")
    return PlayerOut.model_validate(player)
