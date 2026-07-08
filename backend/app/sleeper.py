"""Sleeper API client — all external data fetching lives here."""

import httpx
from typing import Any

BASE_URL = "https://api.sleeper.app/v1"


async def fetch_json(url: str) -> Any:
    """Fetch JSON from Sleeper API with basic error handling."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.json()


async def get_players() -> dict[str, Any]:
    """Fetch all NFL players. Returns dict keyed by player ID string."""
    return await fetch_json(f"{BASE_URL}/players/nfl")


async def get_league(league_id: str) -> dict[str, Any]:
    """Fetch league metadata."""
    return await fetch_json(f"{BASE_URL}/league/{league_id}")


async def get_rosters(league_id: str) -> list[dict[str, Any]]:
    """Fetch all rosters for a league."""
    return await fetch_json(f"{BASE_URL}/league/{league_id}/rosters")


async def get_users(league_id: str) -> list[dict[str, Any]]:
    """Fetch all users in a league."""
    return await fetch_json(f"{BASE_URL}/league/{league_id}/users")


async def get_matchups(league_id: str, week: int) -> list[dict[str, Any]]:
    """Fetch matchups for a specific week."""
    return await fetch_json(f"{BASE_URL}/league/{league_id}/matchups/{week}")


async def get_weekly_stats(season: int, week: int) -> dict[str, Any]:
    """Fetch raw stats for a specific week.
    Returns dict of player_id → stats.
    """
    return await fetch_json(f"{BASE_URL}/stats/nfl/regular/{season}/{week}")


async def get_weekly_projections(season: int, week: int) -> dict[str, Any]:
    """Fetch projections as a fallback when stats endpoint lags."""
    return await fetch_json(f"{BASE_URL}/projections/nfl/regular/{season}/{week}")


async def get_nfl_state() -> dict[str, Any]:
    """Fetch current NFL state (week, season, game status)."""
    return await fetch_json(f"{BASE_URL}/state/nfl")
