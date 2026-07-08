"""APScheduler tasks for Sleeper API polling and chaos engine."""

import asyncio
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal
from app.models import League, Player, WeeklyRawStats, Announcement
from app import sleeper
from app.services.chaos import run_all_chaos

scheduler = BackgroundScheduler()


# ──────────────────────────────────────────────
# Task: Sync player pool
# ──────────────────────────────────────────────

def sync_players():
    """Daily 3AM — sync all NFL players from Sleeper."""
    settings = get_settings()
    if not settings.sleeper_league_id:
        return

    loop = asyncio.new_event_loop()
    try:
        players_data = loop.run_until_complete(sleeper.get_players())
    finally:
        loop.close()

    db = SessionLocal()
    try:
        count = 0
        for sleeper_id, data in players_data.items():
            player = db.query(Player).filter(Player.sleeper_id == sleeper_id).first()
            if player:
                player.first_name = data.get("first_name", player.first_name)
                player.last_name = data.get("last_name", player.last_name)
                player.position = data.get("position", player.position)
                player.team_abbr = data.get("team", player.team_abbr)
                player.injury_status = data.get("injury_status", player.injury_status)
                player.bye_week = data.get("bye_week", player.bye_week)
            else:
                db.add(Player(
                    sleeper_id=sleeper_id,
                    first_name=data.get("first_name", ""),
                    last_name=data.get("last_name", ""),
                    position=data.get("position", ""),
                    team_abbr=data.get("team"),
                    bye_week=data.get("bye_week"),
                    injury_status=data.get("injury_status", "active"),
                ))
            count += 1
        db.commit()
        print(f"[scheduler] Synced {count} players")
    finally:
        db.close()


# ──────────────────────────────────────────────
# Task: Ingest weekly stats
# ──────────────────────────────────────────────

def ingest_stats(week: int, season: int):
    """Every 5 min during games — ingest raw stats from Sleeper.

    Falls back to projections if the stats endpoint returns empty/error.
    """
    settings = get_settings()
    if not settings.sleeper_league_id:
        return

    loop = asyncio.new_event_loop()
    try:
        try:
            stats = loop.run_until_complete(sleeper.get_weekly_stats(season, week))
        except Exception:
            print(f"[scheduler] Stats endpoint failed, trying projections for week {week}")
            stats = loop.run_until_complete(sleeper.get_weekly_projections(season, week))
            source = "projections"
        else:
            source = "stats"
    finally:
        loop.close()

    if not stats:
        return

    db = SessionLocal()
    try:
        count = 0
        for sleeper_player_id, stat_line in stats.items():
            player = db.query(Player).filter(Player.sleeper_id == sleeper_player_id).first()
            if not player:
                continue

            existing = db.query(WeeklyRawStats).filter(
                WeeklyRawStats.player_id == player.id,
                WeeklyRawStats.week == week,
                WeeklyRawStats.season == season,
            ).first()

            if existing:
                existing.stats = stat_line
                existing.source = source
            else:
                db.add(WeeklyRawStats(
                    player_id=player.id,
                    week=week,
                    season=season,
                    source=source,
                    stats=stat_line,
                ))
            count += 1
        db.commit()
        print(f"[scheduler] Ingested {count} stat lines for week {week} ({source})")
    finally:
        db.close()


# ──────────────────────────────────────────────
# Task: Check for unacknowledged chaos announcements
# ──────────────────────────────────────────────

def check_announcements() -> list[dict]:
    """Return any unacknowledged announcements for the PWA polling endpoint."""
    db = SessionLocal()
    try:
        anns = db.query(Announcement).filter(Announcement.acknowledged == False)\
            .order_by(Announcement.created_at.desc()).limit(10).all()
        return [
            {
                "id": str(a.id),
                "type": a.announcement_type,
                "title": a.title,
                "message": a.message,
                "emoji": a.emoji,
                "created_at": a.created_at.isoformat(),
            }
            for a in anns
        ]
    finally:
        db.close()


# ──────────────────────────────────────────────
# Task: Run chaos engine
# ──────────────────────────────────────────────

def run_chaos(week: int, season: int):
    """Tuesday 11AM — execute all enabled chaos rules."""
    settings = get_settings()
    if not settings.sleeper_league_id:
        return

    db = SessionLocal()
    try:
        league = db.query(League).filter(
            League.sleeper_league_id == settings.sleeper_league_id
        ).first()
        if not league:
            print("[scheduler] No league found for chaos run")
            return

        result = run_all_chaos(db, league.id, week, season)
        print(f"[scheduler] Chaos run complete: {result}")
    finally:
        db.close()


# ──────────────────────────────────────────────
# Start / stop
# ──────────────────────────────────────────────

def start_scheduler():
    """Register and start all cron jobs."""
    settings = get_settings()

    if not settings.sleeper_league_id:
        print("[scheduler] No SLEEPER_LEAGUE_ID set — skipping cron registration")
        return

    # Daily 3AM: sync players
    scheduler.add_job(sync_players, "cron", hour=3, minute=0, id="sync_players")

    # Tuesday 9AM: scoring (stubbed)
    # Tuesday 11AM: chaos
    scheduler.add_job(run_chaos, "cron", day_of_week="tue", hour=11, minute=0,
                      args=[0, 0], id="run_chaos")  # week/season filled at runtime

    scheduler.start()
    print("[scheduler] Started")
