---
type: Guide
title: Sleepiez — Database Guide
description: PostgreSQL schema — tables, columns, types, JSONB structures, and indexes.
tags: [database, postgres, schema, sql]
timestamp: 2026-07-07T20:40:00Z
---

# Sleepiez — Database Guide

PostgreSQL 16 on the `postgres-shared` container on `studio`. See [`~/okf/infrastructure/DATABASE-GUIDE.md`](../../../okf/infrastructure/DATABASE-GUIDE.md) for shared instance credentials.

---

## Connection

| Detail | Value |
|--------|-------|
| Host | `postgres-shared` (internal Docker network) |
| Port | 5432 |
| Database | `sleepiez` |
| User | `sleepiez` |

---

## Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, `gen_random_uuid()` |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| display_name | VARCHAR(100) | |
| is_admin | BOOLEAN | Default false |
| created_at | TIMESTAMPTZ | Default NOW() |
| last_login_at | TIMESTAMPTZ | |

### `leagues`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(200) | |
| season | INTEGER | |
| sleeper_league_id | VARCHAR(50) | Sleeper API league ID |
| league_config | JSONB | Chaos toggle config |
| roster_size | INTEGER | Default 16 |
| starters_count | INTEGER | Default 9 |
| scoring_type | VARCHAR(50) | Default 'ppr' |
| waiver_budget | INTEGER | Default 100 |
| created_at | TIMESTAMPTZ | |

**`league_config` JSONB structure:**
```json
{
  "clown_car_enabled": false,
  "clown_car_threshold": 20,
  "hex_enabled": false,
  "steal_a_player_enabled": false,
  "taco_trophy_enabled": false,
  "morale_multiplier_enabled": false,
  "auto_rename_enabled": false
}
```

### `teams`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| league_id | UUID | FK → leagues |
| user_id | UUID | FK → users |
| name | VARCHAR(200) | |
| abbreviation | VARCHAR(5) | |
| taco_count | INTEGER | Default 0 |
| morale | INTEGER | Default 50 |
| team_name_override | TEXT | Set by auto-rename rule |
| waiver_rank | INTEGER | |
| faab_remaining | INTEGER | Default 100 |
| wins | INTEGER | |
| losses | INTEGER | |
| ties | INTEGER | |
| total_points | FLOAT | |
| created_at | TIMESTAMPTZ | |

### `rosters`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| team_id | UUID | FK → teams |
| starters | JSONB | Array of player_id strings |
| bench | JSONB | Array of player_id strings |
| updated_at | TIMESTAMPTZ | |

### `matchups`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| league_id | UUID | FK → leagues |
| week | INTEGER | |
| home_team_id | UUID | FK → teams |
| away_team_id | UUID | FK → teams |
| raw_points | FLOAT | Before modifiers |
| bonus_points | FLOAT | Chaos bonuses |
| penalty_points | FLOAT | Chaos penalties |
| final_score | FLOAT | After all modifiers |
| is_playoff | BOOLEAN | |
| is_complete | BOOLEAN | |
| week_start | TIMESTAMPTZ | |
| week_end | TIMESTAMPTZ | |

### `fun_metrics`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| week | INTEGER | |
| team_id | UUID | FK → teams |
| bench_points_left | FLOAT | Points left on bench |
| clown_car_victim | BOOLEAN | Flagged by Clown Car |
| hexed | BOOLEAN | Cursed by The Hex |

### `temporary_loans`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| player_id | UUID | FK → players |
| original_team_id | UUID | FK → teams |
| borrowing_team_id | UUID | FK → teams |
| expires_at | TIMESTAMPTZ | |

### `players`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| sleeper_id | VARCHAR(50) | UNIQUE, from Sleeper API |
| first_name | VARCHAR(100) | |
| last_name | VARCHAR(100) | |
| position | VARCHAR(10) | QB, RB, WR, TE, K, DEF |
| team_abbr | VARCHAR(5) | |
| bye_week | INTEGER | |
| injury_status | VARCHAR(20) | |
| created_at | TIMESTAMPTZ | |

### `weekly_raw_stats`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| player_id | UUID | FK → players |
| week | INTEGER | |
| season | INTEGER | |
| source | VARCHAR(20) | 'stats' or 'projections' |
| stats | JSONB | Raw Sleeper stat line |
| ingested_at | TIMESTAMPTZ | |

### `auth_codes`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| email | VARCHAR(255) | |
| code | VARCHAR(6) | |
| expires_at | TIMESTAMPTZ | |
| used_at | TIMESTAMPTZ | Null until used |
| created_at | TIMESTAMPTZ | |

---

## Indexes

| Table | Index | Columns |
|-------|-------|---------|
| teams | idx_teams_league | league_id |
| teams | idx_teams_user | user_id |
| players | idx_players_position | position |
| players | idx_players_team | team_abbr |
| players | idx_players_name | (last_name, first_name) |
| matchups | idx_matchups_week | (league_id, week) |
| matchups | idx_matchups_team | (home_team_id, away_team_id) |
| weekly_raw_stats | idx_raw_stats_lookup | (player_id, week, season) |

---

## Postgres Functions

| Function | Purpose |
|----------|---------|
| `calculate_fantasy_points(stats JSONB)` | Converts raw stats → fantasy points per scoring rules |
| `apply_clown_car(league_id UUID, threshold INT)` | Flags and swaps bench > starters by threshold |
| `apply_hex(league_id UUID)` | Flags highest scorer from last week |
| `check_taco_trophy(league_id UUID)` | Increments taco_count for lowest scorer |

See [`SCORING-GUIDE.md`](SCORING-GUIDE.md) and [`CHAOS-GUIDE.md`](CHAOS-GUIDE.md) for function details.

---

## Reference

- [`ARCHITECTURE-GUIDE.md`](ARCHITECTURE-GUIDE.md) — system overview
- [`SCORING-GUIDE.md`](SCORING-GUIDE.md) — function specs
- [`CHAOS-GUIDE.md`](CHAOS-GUIDE.md) — chaos rules
