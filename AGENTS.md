---
type: AgentContext
title: Sleepiez — Agent Context
description: Fantasy football league app for the homiez. Mobile-first PWA with React/Vite + Tailwind + Python FastAPI + PostgreSQL.
tags: [sleepiez, fantasy-football, index, react, fastapi, pwa]
timestamp: 2026-07-07T20:40:00Z
---

# Sleepiez — Fantasy Football

A fantasy football league app for the homiez. Mobile-first PWA with warm cream/gold design system. Powered by Sleeper API data with custom scoring and chaos modifier rules.

---

## Quick Start

```bash
# Frontend
npm install
npm run dev              # Vite dev server

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python FastAPI + APScheduler |
| Database | PostgreSQL 16 on `studio` (shared instance) |
| Data Source | Sleeper API (polled via cron) |
| Hosting | Coolify → `studio` (Hetzner) |
| PWA | vite-plugin-pwa + service worker |

---

## Project Structure

```
sleepiez/
├── docs/                     ← OKF documentation (one concept per file)
│   ├── _OKF.md               ← OKF format specification
│   ├── ARCHITECTURE-GUIDE.md ← System architecture
│   ├── FRONTEND-GUIDE.md     ← React/Vite + PWA
│   ├── API-GUIDE.md          ← REST endpoints
│   ├── SCORING-GUIDE.md      ← Scoring engine
│   ├── CHAOS-GUIDE.md        ← Chaos modifier rules
│   ├── DATA-PIPELINE-GUIDE.md ← Sleeper API sync
│   ├── DATABASE-GUIDE.md     ← PostgreSQL schema
│   └── DEPLOYMENT-GUIDE.md   ← Coolify/Hetzner deploy
├── frontend/                 ← React/Vite SPA
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── pages/
│   │   └── components/
│   ├── manifest.json
│   └── tailwind.config.js
├── backend/                  ← FastAPI + APScheduler
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── services/
│   │   └── models.py
│   └── migrations/
├── tailwind.config.js
├── package.json
└── AGENTS.md
```

---

## Documentation Map

| Doc | What it covers |
|-----|----------------|
| [`docs/ARCHITECTURE-GUIDE.md`](docs/ARCHITECTURE-GUIDE.md) | System overview — frontend, backend, database, pipeline |
| [`docs/FRONTEND-GUIDE.md`](docs/FRONTEND-GUIDE.md) | React/Vite SPA, pages, design tokens, PWA |
| [`docs/API-GUIDE.md`](docs/API-GUIDE.md) | All REST endpoints with request/response shapes |
| [`docs/SCORING-GUIDE.md`](docs/SCORING-GUIDE.md) | Scoring engine — point rules, Postgres function |
| [`docs/CHAOS-GUIDE.md`](docs/CHAOS-GUIDE.md) | Chaos rules — Clown Car, Hex, Taco Trophy, etc. |
| [`docs/DATA-PIPELINE-GUIDE.md`](docs/DATA-PIPELINE-GUIDE.md) | Sleeper API cron schedules and data flow |
| [`docs/DATABASE-GUIDE.md`](docs/DATABASE-GUIDE.md) | Full PostgreSQL schema reference |
| [`docs/DEPLOYMENT-GUIDE.md`](docs/DEPLOYMENT-GUIDE.md) | Coolify deployment on Hetzner studio |

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | React/Vite | JSX for chaos conditional rendering, better PWA ecosystem |
| Roster storage | JSONB arrays | Flexible for Clown Car swaps, temp loans, position matching |
| Chaos engine | Postgres functions + Python service | Scoring runs in-DB for performance; orchestration in Python |
| League management | Self-managed in Postgres | Sleeper provides only raw NFL stats/players. League rules, scoring, chaos, and lineup management are all ours. |
| Data pipeline | Python APScheduler | Same language as API backend; no separate Node process |
| Auth | Email OTP via SES | Multi-user support, external-domain compatible |
| Documentation | OKF format | One concept per file, YAML frontmatter, agent-readable |

---

## Design System

All tokens in `tailwind.config.js`. See [`docs/FRONTEND-GUIDE.md`](docs/FRONTEND-GUIDE.md) for the full reference.

| Token Family | Role |
|--------------|------|
| `ink-*` | Chrome/text colors (900 → 200) |
| `cream-*`/`surface` | Backgrounds |
| `gold-*` | Accent/CTA (500 = primary) |
| `green-*` | Live indicators |
| `red-*` | Alerts/pulse |
| `line-*` | Dividers/outlines |

---

## Skills

| Skill | When to use |
|-------|-------------|
| [`coolify-manager`](../../.mimocode/skills/coolify-manager/SKILL.md) | Deploy, restart, env vars, volumes |
| [`cloudflare-manager`](../../.mimocode/skills/cloudflare-manager/SKILL.md) | DNS records, SSL, domain setup |
| [`aws-manager`](../../.mimocode/skills/aws-manager/SKILL.md) | SES email, S3, IAM |
| [`github-manager`](../../.mimocode/skills/github-manager/SKILL.md) | Create repos, push code |

---

## Dev Commands

```bash
npm install              # Install all dependencies
npm run dev              # Vite dev server (frontend)
npm run build            # Production build

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
