import asyncio
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import League, Player, Roster, Team
from app.routers.auth import get_current_user
from app import sleeper

router = APIRouter(prefix="/api/draft", tags=["draft"])


@router.post("/sync-players")
def sync_players(db: Session = Depends(get_db)):
    """Manually trigger a sync of all NFL players from Sleeper."""
    loop = asyncio.new_event_loop()
    try:
        players_data = loop.run_until_complete(sleeper.get_players())
    finally:
        loop.close()

    count = 0
    for sleeper_id, data in players_data.items():
        first = (data.get("first_name") or "").strip()
        last = (data.get("last_name") or "").strip()
        pos = data.get("position") or ""
        if not first or not last or not pos:
            continue

        player = db.query(Player).filter(Player.sleeper_id == sleeper_id).first()
        if player:
            player.first_name = first
            player.last_name = last
            player.position = pos
            player.team_abbr = data.get("team") or player.team_abbr
            player.bye_week = data.get("bye_week") or player.bye_week
            player.injury_status = data.get("injury_status", "active")
        else:
            db.add(Player(
                sleeper_id=sleeper_id,
                first_name=first,
                last_name=last,
                position=pos,
                team_abbr=data.get("team"),
                bye_week=data.get("bye_week"),
                injury_status=data.get("injury_status", "active"),
            ))
        count += 1

    db.commit()
    return {"ok": True, "players_synced": count}


@router.get("/status")
def draft_status(db: Session = Depends(get_db)):
    """Get current draft state — round, whose turn, picks made."""
    league = db.query(League).first()
    if not league:
        raise HTTPException(404, "No league")

    teams = db.query(Team).order_by(Team.waiver_rank).all()
    roster_size = league.roster_size or 15
    total_rounds = roster_size

    # Calculate draft state from roster sizes
    picks_made = 0
    for t in teams:
        roster = db.query(Roster).filter(Roster.team_id == t.id).first()
        if roster:
            picks_made += len(roster.starters or []) + len(roster.bench or [])

    current_round = (picks_made // len(teams)) + 1 if len(teams) > 0 else 1
    pick_in_round = (picks_made % len(teams)) + 1 if len(teams) > 0 else 1

    # Snake order: odd rounds go 1→N, even rounds go N→1
    snake_pick = pick_in_round if current_round % 2 == 1 else (len(teams) + 1 - pick_in_round)
    current_team_index = snake_pick - 1

    current_team = teams[current_team_index] if 0 <= current_team_index < len(teams) else None

    # Build roster map to avoid repeated DB queries
    roster_map = {}
    for t in teams:
        roster = db.query(Roster).filter(Roster.team_id == t.id).first()
        roster_map[t.id] = (roster.starters or []) + (roster.bench or []) if roster else []

    # Get all drafted player IDs
    drafted = set()
    for t in teams:
        for pid in roster_map.get(t.id, []):
            drafted.add(str(pid))

    return {
        "in_progress": picks_made < len(teams) * total_rounds,
        "current_round": min(current_round, total_rounds),
        "total_rounds": total_rounds,
        "picks_made": picks_made,
        "total_picks": len(teams) * total_rounds,
        "current_team": {
            "id": str(current_team.id),
            "name": current_team.name,
            "abbreviation": current_team.abbreviation,
            "owner_name": current_team.owner.display_name if current_team and current_team.owner else None,
        } if current_team else None,
        "drafted_players": list(drafted),
        "teams": [
            {
                "id": str(t.id),
                "name": t.name,
                "abbreviation": t.abbreviation,
                "owner_name": t.owner.display_name if t.owner else None,
                "picks": len(roster_map.get(t.id, [])),
            }
            for t in teams
        ],
    }


@router.get("/available")
def available_players(
    position: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List players not yet drafted, optionally filtered by position/search."""
    # Get all drafted player IDs
    teams = db.query(Team).all()
    drafted_ids = set()
    for t in teams:
        roster = db.query(Roster).filter(Roster.team_id == t.id).first()
        if roster:
            for pid in (roster.starters or []) + (roster.bench or []):
                drafted_ids.add(str(pid))

    q = db.query(Player)
    if drafted_ids:
        q = q.filter(~Player.id.in_([uuid.UUID(pid) for pid in drafted_ids]))
    # Filter out non-skill positions for drafting simplicity
    q = q.filter(Player.position.in_(["QB", "RB", "WR", "TE", "K", "DEF"]))

    if position and position.upper() in ("QB", "RB", "WR", "TE", "K", "DEF"):
        q = q.filter(Player.position == position.upper())

    if search:
        like = f"%{search}%"
        q = q.filter(Player.first_name.ilike(like) | Player.last_name.ilike(like))

    players = q.order_by(
        # Rank by positional value roughly
        Player.position,
        Player.last_name,
        Player.first_name,
    ).limit(100).all()

    return [
        {
            "id": str(p.id),
            "sleeper_id": p.sleeper_id,
            "first_name": p.first_name,
            "last_name": p.last_name,
            "position": p.position,
            "team_abbr": p.team_abbr,
            "bye_week": p.bye_week,
            "injury_status": p.injury_status,
        }
        for p in players
    ]


@router.post("/pick")
def make_pick(
    player_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Draft a player for your team."""
    from uuid import UUID

    team = db.query(Team).filter(Team.user_id == user.id).first()
    if not team:
        raise HTTPException(404, "No team found for user")

    # Validate player exists and isn't already drafted
    try:
        pid = UUID(player_id)
    except ValueError:
        raise HTTPException(400, "Invalid player ID")

    player = db.query(Player).filter(Player.id == pid).first()
    if not player:
        raise HTTPException(404, "Player not found")

    # Check if already drafted
    all_rosters = db.query(Roster).all()
    for r in all_rosters:
        if str(pid) in (r.starters or []) or str(pid) in (r.bench or []):
            raise HTTPException(409, "Player already drafted")

    roster = db.query(Roster).filter(Roster.team_id == team.id).first()
    if not roster:
        roster = Roster(team_id=team.id, starters=[], bench=[])
        db.add(roster)

    # Add to roster (first 9 picks go to starters, rest to bench)
    current_count = len(roster.starters or []) + len(roster.bench or [])
    league = db.query(League).first()
    starters_count = league.starters_count or 9

    if current_count < starters_count:
        roster.starters = (roster.starters or []) + [str(pid)]
    else:
        roster.bench = (roster.bench or []) + [str(pid)]

    db.commit()
    return {"ok": True, "player": f"{player.first_name} {player.last_name}", "slot": "starter" if current_count < starters_count else "bench"}
