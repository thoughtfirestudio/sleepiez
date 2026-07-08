---
type: Guide
title: Sleepiez — API Guide
description: All REST API endpoints, request/response shapes, and conventions.
tags: [api, backend, fastapi, rest]
timestamp: 2026-07-07T20:40:00Z
---

# Sleepiez — API Guide

FastAPI REST API served at `/api/*`. OpenAPI docs at `/api/docs` when running.

---

## Conventions

### Response Shapes

**Success:**
```json
{ "ok": true, ...data }
```

**List:**
```json
{ "items": [...], "total": 10 }
```

**Error:**
```json
{ "detail": "Human-readable error message" }
```

### Status Codes
| Code | When |
|------|------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 401 | Not authenticated |
| 404 | Not found |
| 500 | Server error |

---

## Endpoints

### Auth

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/login` | Request OTP code |
| POST | `/api/auth/verify` | Verify OTP code |

**POST /api/auth/login**
```json
{ "email": "user@example.com" }
```
→ `{ "ok": true, "message": "Code sent" }`

**POST /api/auth/verify**
```json
{ "email": "user@example.com", "code": "1234" }
```
→ `{ "ok": true, "user": { "id": "...", "email": "...", "display_name": "..." } }`

### League

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/league` | League info + config |
| GET | `/api/league/standings` | Standings with all teams |
| PATCH | `/api/league/config` | Update chaos config (admin) |
| GET | `/api/league/config` | Current chaos config |

### Teams

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/teams/mine` | My team |
| GET | `/api/teams/mine/roster` | Full roster with starters/bench |
| PATCH | `/api/teams/mine/rename` | Override team name (if eligible) |

### Matchups

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/matchups/current` | Current week matchup |
| GET | `/api/matchups/history` | Completed matchups |
| GET | `/api/matchups/{id}` | Single matchup detail |

### Players

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/players` | Available players (filters: position, status, search) |
| GET | `/api/players/{id}` | Single player detail |

### Waivers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/waivers` | Pending waiver claims |
| POST | `/api/waivers/claim` | Submit waiver claim |
| DELETE | `/api/waivers/claim/{id}` | Cancel waiver claim |

### Chaos / Fun

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/chaos/fun-metrics` | Current week fun_metrics per team |
| GET | `/api/chaos/announcements` | Pending chaos announcements (polled by PWA) |
| GET | `/api/chaos/taco-trophy` | Taco trophy leaderboard |

---

## Reference

- [`ARCHITECTURE-GUIDE.md`](ARCHITECTURE-GUIDE.md) — system overview
- [`SCORING-GUIDE.md`](SCORING-GUIDE.md) — scoring engine details
- [`CHAOS-GUIDE.md`](CHAOS-GUIDE.md) — chaos modifier rules
