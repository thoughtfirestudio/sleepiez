from pydantic import BaseModel, EmailStr
from typing import Any
from datetime import datetime
import uuid


# --- Auth ---
class LoginRequest(BaseModel):
    email: EmailStr

class VerifyRequest(BaseModel):
    email: EmailStr
    code: str

class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    display_name: str | None = None
    is_admin: bool = False
    model_config = {"from_attributes": True}


# --- League ---
class LeagueConfigOut(BaseModel):
    clown_car_enabled: bool = False
    clown_car_threshold: int = 20
    hex_enabled: bool = False
    steal_a_player_enabled: bool = False
    taco_trophy_enabled: bool = False
    morale_multiplier_enabled: bool = False
    auto_rename_enabled: bool = False

class LeagueOut(BaseModel):
    id: uuid.UUID
    name: str
    season: int
    sleeper_league_id: str | None = None
    league_config: Any  # JSONB
    roster_size: int
    starters_count: int
    scoring_type: str
    waiver_budget: int
    model_config = {"from_attributes": True}

class TeamOut(BaseModel):
    id: uuid.UUID
    name: str
    abbreviation: str | None = None
    taco_count: int = 0
    morale: int = 50
    team_name_override: str | None = None
    waiver_rank: int
    faab_remaining: int
    wins: int
    losses: int
    ties: int
    total_points: float
    model_config = {"from_attributes": True}

class LeagueStandings(LeagueOut):
    teams: list[TeamOut]


# --- Roster ---
class PlayerOut(BaseModel):
    id: uuid.UUID
    sleeper_id: str | None = None
    first_name: str
    last_name: str
    position: str
    team_abbr: str | None = None
    bye_week: int | None = None
    injury_status: str = "active"
    model_config = {"from_attributes": True}

class RosterOut(BaseModel):
    id: uuid.UUID
    team_id: uuid.UUID
    starters: list[str]  # player_id UUIDs as strings
    bench: list[str]
    updated_at: datetime
    model_config = {"from_attributes": True}

class TeamRoster(TeamOut):
    roster: RosterOut | None = None


# --- Matchups ---
class MatchupOut(BaseModel):
    id: uuid.UUID
    week: int
    home_team_id: uuid.UUID
    away_team_id: uuid.UUID
    raw_points: float = 0.0
    bonus_points: float = 0.0
    penalty_points: float = 0.0
    final_score: float = 0.0
    is_playoff: bool = False
    is_complete: bool = False
    model_config = {"from_attributes": True}


# --- Fun / Chaos ---
class FunMetricsOut(BaseModel):
    week: int
    team_id: uuid.UUID
    bench_points_left: float = 0.0
    clown_car_victim: bool = False
    hexed: bool = False
    model_config = {"from_attributes": True}

class AnnouncementOut(BaseModel):
    id: uuid.UUID
    announcement_type: str
    title: str
    message: str
    emoji: str
    acknowledged: bool = False
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Waivers ---
class WaiverClaimOut(BaseModel):
    id: uuid.UUID
    player_id: uuid.UUID
    bid_amount: int
    priority: int | None = None
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Config Update ---
class ChaosConfigUpdate(BaseModel):
    clown_car_enabled: bool | None = None
    clown_car_threshold: int | None = None
    hex_enabled: bool | None = None
    steal_a_player_enabled: bool | None = None
    taco_trophy_enabled: bool | None = None
    morale_multiplier_enabled: bool | None = None
    auto_rename_enabled: bool | None = None
