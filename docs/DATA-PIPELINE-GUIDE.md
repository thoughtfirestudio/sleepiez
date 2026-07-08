---
type: Guide
title: Sleepiez — Data Pipeline Guide
description: Sleeper API integration — cron schedules, endpoints polled, data flow, and error handling.
tags: [data-pipeline, sleeper, api, cron, apscheduler]
timestamp: 2026-07-07T20:40:00Z
---

# Sleepiez — Data Pipeline Guide

Sleepiez polls the Sleeper API on a cron schedule to keep the local Postgres database in sync. The PWA never calls Sleeper directly — all frontend requests hit the FastAPI backend.

---

## Sleeper API Endpoints

| Endpoint | When | What we store |
|----------|------|---------------|
| `GET /v1/players/nfl` | Daily 3 AM | Players table (name, position, team, injury) |
| `GET /v1/stats/nfl/regular/{season}/{week}` | Every 5 min during games | `weekly_raw_stats` |
| `GET /v1/projections/nfl/regular/{season}/{week}` | Fallback if stats endpoint lags | Same `weekly_raw_stats` table |
| `GET /v1/state/nfl` | Every 2 min | Game state (quarter, down, distance) for live dashboard |

---

## Pipeline Architecture

```
APScheduler ──▶ sleeper.py ──▶ Sleeper REST API
    │                              │
    │                              ▼
    │                         Raw JSON
    │                              │
    ▼                              ▼
scheduler.py ──▶ database.py ──▶ PostgreSQL
```

### `sleeper.py` — API Client
- Handles all HTTP requests to `https://api.sleeper.app/v1`
- Implements rate limiting (respect Sleeper's limits)
- Returns parsed JSON
- Logs errors without crashing the scheduler

### `scheduler.py` — APScheduler Tasks
- `sync_players()` — Daily 3 AM
- `ingest_stats()` — Every 5 min (checks if games are active first)
- `update_game_state()` — Every 2 min
- `run_scoring()` — Tuesday 9 AM
- `run_chaos_checks()` — Tuesday 11 AM

---

## Cron Schedule

| Task | Cron | Sleeper Endpoint |
|------|------|------------------|
| sync_players | `0 3 * * *` | `/v1/players/nfl` |
| ingest_stats | `*/5 13-23 * * 1` (Mon nights) and `*/5 9-23 * * 0` (Sun) | `/v1/stats/nfl/regular/{season}/{week}` |
| update_game_state | `*/2 * * * 0,1` (Sun-Mon only) | `/v1/state/nfl` |
| run_scoring | `0 9 * * 2` (Tue 9 AM) | — (reads from Postgres) |
| run_chaos_checks | `0 11 * * 2` (Tue 11 AM) | — (reads from Postgres) |

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Sleeper API down | Retry 3x with 30s backoff, log error, skip this cycle |
| Stats endpoint lags | Fall back to projections endpoint for same week |
| Partial stat ingestion | Upsert — re-running the task overwrites existing rows |
| Player not found | Log warning, skip, continue processing |
| League config missing | Default to disabled for all chaos rules |

---

## Reference

- [`SCORING-GUIDE.md`](SCORING-GUIDE.md) — how stats become points
- [`ARCHITECTURE-GUIDE.md`](ARCHITECTURE-GUIDE.md) — system overview
- [`DEPLOYMENT-GUIDE.md`](DEPLOYMENT-GUIDE.md) — deployment
