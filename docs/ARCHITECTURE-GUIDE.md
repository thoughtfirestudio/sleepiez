---
type: Guide
title: Sleepiez — Architecture Guide
description: Overall system architecture — frontend, backend, database, and data pipeline relationships.
tags: [architecture, overview, system-map]
timestamp: 2026-07-07T20:40:00Z
---

# Sleepiez — Architecture Guide

Sleepiez is a fantasy football league app for friends. Mobile-first PWA with a warm cream/gold design system, powered by Sleeper API data with custom scoring and chaos modifier rules.

---

## Architecture Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Browser    │────▶│  FastAPI Server  │────▶│  PostgreSQL  │
│  (React SPA) │     │  (Python 3.14)   │     │  (pgvector)  │
│  PWA + Off   │◀────│  + APScheduler   │◀────│  + Functions  │
└──────────────┘     └────────┬─────────┘     └──────────────┘
                              │
                              │ (cron tasks)
                              ▼
                     ┌──────────────────┐
                     │  Sleeper API     │
                     │  (NFL data)      │
                     └──────────────────┘
```

## Layers

### Frontend (React/Vite + Tailwind)
- Hash-based SPA router via React Router
- Fetches from `/api/*` endpoints only — never calls Sleeper directly
- PWA with service worker for offline-capable dashboard
- 60s polling for chaos announcements (iOS PWA limitation)

See [`FRONTEND-GUIDE.md`](FRONTEND-GUIDE.md).

### Backend (Python FastAPI)
- Serves REST API at `/api/*`
- Runs APScheduler for Sleeper data sync (daily, every-5-min during games)
- Hosts scoring engine as Postgres functions
- Static file server for frontend (production) or CORS proxy for dev

See [`API-GUIDE.md`](API-GUIDE.md) and [`SCORING-GUIDE.md`](SCORING-GUIDE.md).

### Database (PostgreSQL 16 on `studio`)
- Shared `postgres-shared` instance on the `coolify` network
- Database: `sleepiez`, User: `sleepiez`
- JSONB columns for flexible roster/chaos config storage
- Postgres functions for scoring and chaos engine

See [`DATABASE-GUIDE.md`](DATABASE-GUIDE.md).

### Data Pipeline (APScheduler + Sleeper API)
- Daily 3 AM: sync player pool from Sleeper
- Every 5 min during games: ingest raw stats
- Every 2 min: update game state (quarter, down, distance)
- Tuesday 9 AM: run scoring engine
- Tuesday 11 AM: run chaos modifier checks

See [`DATA-PIPELINE-GUIDE.md`](DATA-PIPELINE-GUIDE.md).

---

## Hosting

| Component | Host | Details |
|-----------|------|---------|
| Postgres | `studio` (178.104.35.18) | `postgres-shared` container, `coolify` network |
| Backend | `studio` | Coolify app (Dockerfile) |
| Frontend | `studio` | Served by FastAPI (production) or Vite dev server |

See [`DEPLOYMENT-GUIDE.md`](DEPLOYMENT-GUIDE.md).

---

## Key Files

| File | Role |
|------|------|
| `frontend/src/App.tsx` | React app root, routes |
| `backend/app/main.py` | FastAPI entry point |
| `backend/app/services/scoring.py` | Scoring engine logic |
| `backend/app/services/chaos.py` | Chaos modifier engine |
| `tailwind.config.js` | Design token system |

## Reference

- [`DATABASE-GUIDE.md`](DATABASE-GUIDE.md) — schema
- [`API-GUIDE.md`](API-GUIDE.md) — endpoints
- [`CHAOS-GUIDE.md`](CHAOS-GUIDE.md) — chaos rules
