import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    display_name = Column(String(100), nullable=True)
    is_admin = Column(Boolean, default=False)
    session_token = Column(String(64), nullable=True, index=True)
    challenge_prompt_seen = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    team = relationship("Team", back_populates="owner", uselist=False)


class League(Base):
    __tablename__ = "leagues"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    season = Column(Integer, nullable=False)
    sleeper_league_id = Column(String(50), nullable=True)
    league_config = Column(JSONB, default=dict)
    roster_size = Column(Integer, default=16)
    starters_count = Column(Integer, default=9)
    scoring_type = Column(String(50), default="ppr")
    waiver_budget = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    teams = relationship("Team", back_populates="league")
    matchups = relationship("Matchup", back_populates="league")


class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    league_id = Column(UUID(as_uuid=True), ForeignKey("leagues.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    abbreviation = Column(String(5), nullable=True)
    taco_count = Column(Integer, default=0)
    morale = Column(Integer, default=50)
    team_name_override = Column(Text, nullable=True)
    waiver_rank = Column(Integer, default=1)
    faab_remaining = Column(Integer, default=100)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    ties = Column(Integer, default=0)
    total_points = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    league = relationship("League", back_populates="teams")
    owner = relationship("User", back_populates="team")
    roster = relationship("Roster", back_populates="team", uselist=False)
    fun_metrics = relationship("FunMetrics", back_populates="team")
    waiver_claims = relationship("WaiverClaim", back_populates="team")


class Player(Base):
    __tablename__ = "players"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sleeper_id = Column(String(50), unique=True, nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    position = Column(String(10), nullable=False)  # QB, RB, WR, TE, K, DEF
    team_abbr = Column(String(5), nullable=True)
    bye_week = Column(Integer, nullable=True)
    injury_status = Column(String(20), default="active")  # active, questionable, out, IR
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Roster(Base):
    """JSONB roster — starters and bench are arrays of player_id UUIDs."""
    __tablename__ = "rosters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), unique=True, nullable=False)
    starters = Column(JSONB, default=list)  # ["player-uuid", ...]
    bench = Column(JSONB, default=list)      # ["player-uuid", ...]
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    team = relationship("Team", back_populates="roster")


class Matchup(Base):
    __tablename__ = "matchups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    league_id = Column(UUID(as_uuid=True), ForeignKey("leagues.id"), nullable=False)
    week = Column(Integer, nullable=False)
    home_team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    raw_points = Column(Float, default=0.0)
    bonus_points = Column(Float, default=0.0)
    penalty_points = Column(Float, default=0.0)
    final_score = Column(Float, default=0.0)
    is_playoff = Column(Boolean, default=False)
    is_complete = Column(Boolean, default=False)
    week_start = Column(DateTime(timezone=True), nullable=True)
    week_end = Column(DateTime(timezone=True), nullable=True)

    league = relationship("League", back_populates="matchups")


class FunMetrics(Base):
    """Per-week fun/chaos tracking for each team."""
    __tablename__ = "fun_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    week = Column(Integer, nullable=False)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    bench_points_left = Column(Float, default=0.0)
    clown_car_victim = Column(Boolean, default=False)
    hexed = Column(Boolean, default=False)

    team = relationship("Team", back_populates="fun_metrics")


class TemporaryLoan(Base):
    """Player loaned from one team to another with expiry."""
    __tablename__ = "temporary_loans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    original_team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    borrowing_team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class WeeklyRawStats(Base):
    """Raw Sleeper stat lines per player per week."""
    __tablename__ = "weekly_raw_stats"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    week = Column(Integer, nullable=False)
    season = Column(Integer, nullable=False)
    source = Column(String(20), default="stats")  # 'stats' or 'projections'
    stats = Column(JSONB, default=dict)
    ingested_at = Column(DateTime(timezone=True), default=utcnow)


class WaiverClaim(Base):
    __tablename__ = "waiver_claims"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=False)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    drop_player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=True)
    bid_amount = Column(Integer, default=0)
    priority = Column(Integer, nullable=True)
    status = Column(String(20), default="pending")  # pending, processed, cancelled
    created_at = Column(DateTime(timezone=True), default=utcnow)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    team = relationship("Team", back_populates="waiver_claims")


class AuthCode(Base):
    __tablename__ = "auth_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False)
    code = Column(String(6), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Announcement(Base):
    """Chaos announcements — polled by the PWA every 60s."""
    __tablename__ = "announcements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    announcement_type = Column(String(50), nullable=False)  # clown_car, hex, steal, taco, rename
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    emoji = Column(String(10), nullable=False)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Challenge(Base):
    """Weekly pre-draft challenge with trivia questions."""
    __tablename__ = "challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    week_number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    questions = Column(JSONB, default=list)
    opens_at = Column(DateTime(timezone=True), nullable=False)
    closes_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class ChallengeSubmission(Base):
    """A user's submission for a challenge."""
    __tablename__ = "challenge_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    answers = Column(JSONB, default=list)
    score = Column(Integer, default=0)
    submitted_at = Column(DateTime(timezone=True), default=utcnow)


class UserEvent(Base):
    """User engagement events — page views, actions, etc."""
    __tablename__ = "user_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    event_type = Column(String(100), nullable=False)
    event_data = Column(JSONB, default=dict)
    page_url = Column(String(500), nullable=True)
    session_id = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
