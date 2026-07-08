-- Sleepiez — Full schema (PostgreSQL 16)
-- Replaces the v1 normalized roster design with JSONB arrays.
-- All chaos rules default to disabled in league_config.

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    display_name  VARCHAR(100),
    is_admin      BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- ============================================================
-- LEAGUES
-- ============================================================
CREATE TABLE leagues (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(200) NOT NULL,
    season            INTEGER NOT NULL,
    sleeper_league_id VARCHAR(50),
    league_config     JSONB DEFAULT '{
        "clown_car_enabled": false,
        "clown_car_threshold": 20,
        "hex_enabled": false,
        "steal_a_player_enabled": false,
        "taco_trophy_enabled": false,
        "morale_multiplier_enabled": false,
        "auto_rename_enabled": false
    }'::jsonb,
    roster_size       INTEGER DEFAULT 16,
    starters_count    INTEGER DEFAULT 9,
    scoring_type      VARCHAR(50) DEFAULT 'ppr',
    waiver_budget     INTEGER DEFAULT 100,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE teams (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id         UUID NOT NULL REFERENCES leagues(id),
    user_id           UUID NOT NULL REFERENCES users(id),
    name              VARCHAR(200) NOT NULL,
    abbreviation      VARCHAR(5),
    taco_count        INTEGER DEFAULT 0,
    morale            INTEGER DEFAULT 50,
    team_name_override TEXT,
    waiver_rank       INTEGER DEFAULT 1,
    faab_remaining    INTEGER DEFAULT 100,
    wins              INTEGER DEFAULT 0,
    losses            INTEGER DEFAULT 0,
    ties              INTEGER DEFAULT 0,
    total_points      DOUBLE PRECISION DEFAULT 0.0,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_league ON teams(league_id);
CREATE INDEX idx_teams_user ON teams(user_id);

-- ============================================================
-- PLAYERS (synced from Sleeper API)
-- ============================================================
CREATE TABLE players (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sleeper_id    VARCHAR(50) UNIQUE,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    position      VARCHAR(10) NOT NULL,   -- QB, RB, WR, TE, K, DEF
    team_abbr     VARCHAR(5),
    bye_week      INTEGER,
    injury_status VARCHAR(20) DEFAULT 'active',  -- active, questionable, out, IR
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_team ON players(team_abbr);
CREATE INDEX idx_players_name ON players(last_name, first_name);

-- ============================================================
-- ROSTERS (JSONB arrays of player UUIDs)
-- ============================================================
CREATE TABLE rosters (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id    UUID UNIQUE NOT NULL REFERENCES teams(id),
    starters   JSONB DEFAULT '[]'::jsonb,
    bench      JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MATCHUPS
-- ============================================================
CREATE TABLE matchups (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id      UUID NOT NULL REFERENCES leagues(id),
    week           INTEGER NOT NULL,
    home_team_id   UUID NOT NULL REFERENCES teams(id),
    away_team_id   UUID NOT NULL REFERENCES teams(id),
    raw_points     DOUBLE PRECISION DEFAULT 0.0,
    bonus_points   DOUBLE PRECISION DEFAULT 0.0,
    penalty_points DOUBLE PRECISION DEFAULT 0.0,
    final_score    DOUBLE PRECISION DEFAULT 0.0,
    is_playoff     BOOLEAN DEFAULT FALSE,
    is_complete    BOOLEAN DEFAULT FALSE,
    week_start     TIMESTAMPTZ,
    week_end       TIMESTAMPTZ
);

CREATE INDEX idx_matchups_week ON matchups(league_id, week);
CREATE INDEX idx_matchups_team ON matchups(home_team_id, away_team_id);

-- ============================================================
-- WEEKLY RAW STATS (from Sleeper API)
-- ============================================================
CREATE TABLE weekly_raw_stats (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id   UUID NOT NULL REFERENCES players(id),
    week        INTEGER NOT NULL,
    season      INTEGER NOT NULL,
    source      VARCHAR(20) DEFAULT 'stats',  -- 'stats' or 'projections'
    stats       JSONB DEFAULT '{}'::jsonb,
    ingested_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(player_id, week, season)
);

CREATE INDEX idx_raw_stats_lookup ON weekly_raw_stats(player_id, week, season);

-- ============================================================
-- FUN METRICS (per-week chaos tracking)
-- ============================================================
CREATE TABLE fun_metrics (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week              INTEGER NOT NULL,
    team_id           UUID NOT NULL REFERENCES teams(id),
    bench_points_left DOUBLE PRECISION DEFAULT 0.0,
    clown_car_victim  BOOLEAN DEFAULT FALSE,
    hexed             BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_fun_metrics_week ON fun_metrics(week);
CREATE INDEX idx_fun_metrics_team ON fun_metrics(team_id);

-- ============================================================
-- TEMPORARY LOANS (Steal-a-Player)
-- ============================================================
CREATE TABLE temporary_loans (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id         UUID NOT NULL REFERENCES players(id),
    original_team_id  UUID NOT NULL REFERENCES teams(id),
    borrowing_team_id UUID NOT NULL REFERENCES teams(id),
    expires_at        TIMESTAMPTZ NOT NULL,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WAIVER CLAIMS
-- ============================================================
CREATE TABLE waiver_claims (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id         UUID NOT NULL REFERENCES teams(id),
    player_id       UUID NOT NULL REFERENCES players(id),
    drop_player_id  UUID REFERENCES players(id),
    bid_amount      INTEGER DEFAULT 0,
    priority        INTEGER,
    status          VARCHAR(20) DEFAULT 'pending',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    processed_at    TIMESTAMPTZ
);

CREATE INDEX idx_waivers_team ON waiver_claims(team_id);
CREATE INDEX idx_waivers_status ON waiver_claims(status);

-- ============================================================
-- AUTH CODES (email OTP login)
-- ============================================================
CREATE TABLE auth_codes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL,
    code       VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_codes_email ON auth_codes(email);

-- ============================================================
-- ANNOUNCEMENTS (chaos events — polled by PWA)
-- ============================================================
CREATE TABLE announcements (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_type  VARCHAR(50) NOT NULL,
    title              VARCHAR(200) NOT NULL,
    message            TEXT NOT NULL,
    emoji              VARCHAR(10) NOT NULL,
    acknowledged       BOOLEAN DEFAULT FALSE,
    created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCORING FUNCTION: calculate_fantasy_points
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_fantasy_points(stats JSONB)
RETURNS FLOAT AS $$
DECLARE
  pts FLOAT := 0;
BEGIN
  -- Passing
  pts := pts + COALESCE((stats->>'pass_yds')::FLOAT, 0) * 0.04;
  pts := pts + COALESCE((stats->>'pass_td')::FLOAT, 0) * 6;
  pts := pts + COALESCE((stats->>'pass_int')::FLOAT, 0) * -2;
  -- Rushing
  pts := pts + COALESCE((stats->>'rush_yds')::FLOAT, 0) * 0.1;
  pts := pts + COALESCE((stats->>'rush_td')::FLOAT, 0) * 6;
  -- Receiving (0.5 PPR)
  pts := pts + COALESCE((stats->>'rec')::FLOAT, 0) * 0.5;
  pts := pts + COALESCE((stats->>'rec_yds')::FLOAT, 0) * 0.1;
  pts := pts + COALESCE((stats->>'rec_td')::FLOAT, 0) * 6;
  -- Penalties
  pts := pts + COALESCE((stats->>'fumbles_lost')::FLOAT, 0) * -2;
  pts := pts + COALESCE((stats->>'bonus')::FLOAT, 0);
  -- Kicking
  pts := pts + COALESCE((stats->>'fg_made')::FLOAT, 0) * 3;
  pts := pts + COALESCE((stats->>'fg_made_50_plus')::FLOAT, 0) * 2;
  pts := pts + COALESCE((stats->>'pat_made')::FLOAT, 0) * 1;
  -- Defense
  pts := pts + COALESCE((stats->>'def_td')::FLOAT, 0) * 6;
  pts := pts + COALESCE((stats->>'def_int')::FLOAT, 0) * 2;
  pts := pts + COALESCE((stats->>'def_fum_rec')::FLOAT, 0) * 2;
  pts := pts + COALESCE((stats->>'def_sack')::FLOAT, 0) * 1;
  pts := pts + COALESCE((stats->>'def_safety')::FLOAT, 0) * 2;

  RETURN ROUND(pts::numeric, 1);
END;
$$ LANGUAGE plpgsql;
