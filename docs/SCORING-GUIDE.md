---
type: Guide
title: Sleepiez — Scoring Guide
description: Fantasy scoring engine — how raw stats are converted to points and matchups are resolved.
tags: [scoring, fantasy, points, postgres-functions]
timestamp: 2026-07-07T20:40:00Z
---

# Sleepiez — Scoring Guide

The scoring engine runs every Tuesday 9 AM as an APScheduler task. It ingests raw stats from the Sleeper API and calculates final scores in a single Postgres transaction.

---

## Scoring Rules (0.5 PPR)

| Stat | Points |
|------|--------|
| Passing Yard | 0.04 (1 per 25 yds) |
| Passing TD | 6 |
| Interception | -2 |
| Rushing Yard | 0.1 (1 per 10 yds) |
| Rushing TD | 6 |
| Reception | 0.5 |
| Receiving Yard | 0.1 (1 per 10 yds) |
| Receiving TD | 6 |
| Fumble Lost | -2 |
| 2-Point Conversion | 2 |
| Field Goal (0-49 yds) | 3 |
| Field Goal (50+ yds) | 5 |
| Extra Point | 1 |

---

## Scoring Sequence

1. **Ingest** — Pull `weekly_raw_stats` from Sleeper API for the week
2. **Calculate Base Points** — For each player, run `calculate_fantasy_points()` on their stat JSONB
3. **Sum Per Roster** — Sum each team's starter points to get `raw_points`
4. **Apply Chaos Modifiers** — Check `league_config` and apply enabled rules:
   - Morale Modifier (if enabled): ±2-3 points
   - The Hex (if enabled): ±3 point bonus for hexed opponent
5. **Write Matchups** — Insert/update `matchups` with `final_score`

---

## Postgres Function: `calculate_fantasy_points`

```sql
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
  pts := pts + COALESCE((stats->>'bonus')::FLOAT, 0); -- 2PT conversions
  -- Kicking
  pts := pts + COALESCE((stats->>'fg_made')::FLOAT, 0) * 3;
  pts := pts + COALESCE((stats->>'fg_made_50_plus')::FLOAT, 0) * 2; -- extra 2 pts
  pts := pts + COALESCE((stats->>'pat_made')::FLOAT, 0) * 1;

  RETURN ROUND(pts::numeric, 1);
END;
$$ LANGUAGE plpgsql;
```

---

## Cron Schedule

| Time | Task |
|------|------|
| During games (every 5 min) | Ingest `weekly_raw_stats` from Sleeper `/stats` |
| Tuesday 9:00 AM | Run scoring engine (calculate points + update matchups) |
| Tuesday 11:00 AM | Run chaos checks (if enabled) |

---

## Reference

- [`DATABASE-GUIDE.md`](DATABASE-GUIDE.md) — schema
- [`CHAOS-GUIDE.md`](CHAOS-GUIDE.md) — chaos rules
- [`DATA-PIPELINE-GUIDE.md`](DATA-PIPELINE-GUIDE.md) — Sleeper API sync
