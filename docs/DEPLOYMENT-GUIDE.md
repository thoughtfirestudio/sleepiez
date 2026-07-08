---
type: Guide
title: Sleepiez — Deployment Guide
description: How to deploy the sleepiez backend and frontend to Coolify on the studio Hetzner server.
tags: [deployment, coolify, hetzner, docker, production]
timestamp: 2026-07-07T20:40:00Z
---

# Sleepiez — Deployment Guide

Deployed via Coolify on the `studio` Hetzner server (178.104.35.18). See the [Coolify skill](../../../.mimocode/skills/coolify-manager/SKILL.md) for API commands.

---

## Prerequisites

| Resource | Status |
|----------|--------|
| GitHub repo | `thoughtfirestudio/sleepiez` |
| Coolify project | New project: `sleepiez` |
| Coolify server | `studio` (UUID: `mit4lg14dxfatpw4f7fsyf2m`) |
| Postgres | Shared `postgres-shared` on `studio` |
| Database | `sleepiez` (user: `sleepiez`) |

---

## Database Setup

Connect to `studio` and create the database:

```bash
ssh studio
docker exec -it postgres-shared psql -U postgres
```

```sql
CREATE USER sleepiez WITH PASSWORD '<strong-password>';
CREATE DATABASE sleepiez OWNER sleepiez;
```

Set `DATABASE_URL` in Coolify env vars:
```
DATABASE_URL=postgresql://sleepiez:<password>@postgres-shared:5432/sleepiez
```

---

## Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `ALLOWED_EMAILS` | Yes | Comma-separated emails that can log in |
| `SESSION_SECRET` | Yes | Random 48-byte hex string |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `DEBUG` | No | Set to `False` in production |

---

## Deployment Steps

1. Push code to GitHub (`main` branch)
2. Create Coolify application (Dockerfile build pack)
3. Set env vars in Coolify
4. Enable auto-deploy (`is_auto_deploy_enabled: true`)
5. Provision SSL via Traefik (set Cloudflare to grey cloud first)
6. Verify: visit production URL

---

## Docker

The project includes a `Dockerfile` at the root. Build pack: `dockerfile`.

```dockerfile
# Multi-stage: build frontend, then serve from FastAPI
```

---

## Reference

- [Coolify Manager skill](../../../.mimocode/skills/coolify-manager/SKILL.md) — API commands for all operations
- [`ARCHITECTURE-GUIDE.md`](ARCHITECTURE-GUIDE.md) — system overview
- [`DATA-PIPELINE-GUIDE.md`](DATA-PIPELINE-GUIDE.md) — cron tasks that must keep running
