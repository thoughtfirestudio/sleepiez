---
type: Specification
title: Open Knowledge Format — Sleepiez Adaptation
description: How this project applies the Open Knowledge Format (OKF) for agent-readable documentation.
tags: [okf, documentation, agents, standards]
timestamp: 2026-07-07T20:40:00Z
---

# Open Knowledge Format — Sleepiez Adaptation

This project follows OKF for all agent-facing documentation. Adapted from the IRIS knowledge base at [`~/okf/`](../../../okf/DOCUMENTATION-GUIDE.md).

## Core Rules

1. **One concept per file.** Each `*-GUIDE.md` covers one system (scoring, data pipeline, chaos rules, deployment). Never merge two topics.

2. **AGENTS.md is an index, not a knowledge dump.** Every `AGENTS.md` is a table of contents pointing to where knowledge lives. It contains *what to read*, not *the knowledge itself*.

3. **No duplication across levels.** Facts about the engine live in `docs/`. Facts about a specific deployment live in the Coolify app config. Link, don't copy.

4. **YAML frontmatter on every doc:** `type`, `title`, `description`, `tags`, `timestamp`. Makes every doc queryable without parsing the full body.

5. **Cross-reference, don't copy.** If a page needs a fact from another doc, link to it. Don't paste the same table into multiple files.

## Doc Types Used

| Type | Pattern | Purpose |
|------|---------|---------|
| Guide | `*-GUIDE.md` | HOW a system works (scoring, pipeline, deployment) |
| Agent Context | `AGENTS.md` | Index — what to read for each task |
| Specification | `_OKF.md` | Format specification (this file) |
| Reference | `ref/*` | Lookup tables (ports, env vars, endpoints) |

## File Structure

```
docs/
├── _OKF.md                     ← this file
├── ARCHITECTURE-GUIDE.md       ← overall system architecture
├── FRONTEND-GUIDE.md           ← React/Vite + PWA
├── API-GUIDE.md                ← REST API endpoints
├── SCORING-GUIDE.md            ← fantasy scoring engine
├── CHAOS-GUIDE.md              ← chaos modifier rules
├── DATA-PIPELINE-GUIDE.md      ← Sleeper API sync
├── DATABASE-GUIDE.md           ← PostgreSQL schema
└── DEPLOYMENT-GUIDE.md         ← Coolify/Hetzner deployment
```

## Reference

- [OKF Guide (IRIS)](../../../okf/DOCUMENTATION-GUIDE.md) — upstream standard
- [`AGENTS.md`](../AGENTS.md) — project index
