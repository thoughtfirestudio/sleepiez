---
type: Guide
title: Sleepiez — Chaos Guide
description: The chaos modifier engine — all 6 rules, their triggers, and implementation details.
tags: [chaos, rules, scoring, postgres-functions, clown-car, hex]
timestamp: 2026-07-07T20:40:00Z
---

# Sleepiez — Chaos Guide

All chaos rules are implemented as Postgres functions and Python service calls. Each rule is togglable via the `league_config` JSONB column on the `leagues` table.

---

## Chaos Config

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

All rules default to **disabled**. Change any value to `true` and the Tuesday 11 AM cron run will activate it.

---

## Rule 1: The Clown Car

**Target:** Teams whose bench outscored their starters by ≥ threshold (default 20 pts).

**Execution:**
1. Unnest each team's `bench` JSONB array, sum raw points via `weekly_raw_stats`
2. Compare bench total vs starter total
3. If bench_score - starter_score ≥ threshold → flag `clown_car_victim = true` in `fun_metrics`
4. Find highest-scoring bench player and lowest-scoring starter of matching position
5. Swap them in the `rosters.starters` array for the upcoming week
6. PWA displays a red "🤡 FORCED SUB" badge on the swapped player

**Position matching constraint:** QB→QB, RB→RB, WR→WR, TE→TE, K→K. FLEX spots can accept RB/WR/TE.

```sql
-- Simplified Clown Car check
SELECT team_id,
       (SELECT SUM(pts) FROM calculate_roster_points(starters)) AS starter_pts,
       (SELECT SUM(pts) FROM calculate_roster_points(bench)) AS bench_pts
FROM rosters;
```

---

## Rule 2: The Hex (Defensive Curse)

**Target:** The highest-scoring team from last week.

**Execution:**
1. After scores finalize, find the team with the highest `final_score` from last week
2. Set `hexed = true` in `fun_metrics` for that team
3. This week, their opponent gets a +3 point bonus applied during scoring

---

## Rule 3: Steal-a-Player Monday

**Target:** Lowest-scoring team steals a bench player from highest-scoring team.

**Execution:**
1. After scores finalize, identify highest and lowest scoring teams
2. Lowest scorer picks one player from highest scorer's bench (via UI)
3. Record inserted into `temporary_loans` with 7-day expiry
4. Scoring engine checks `temporary_loans` before calculating rosters — loaned player plays for borrowing team

---

## Rule 4: Taco Trophy

**Target:** Team with the lowest weekly score.

**Execution:**
1. Find the team with the lowest `final_score` each week
2. Increment their `taco_count` by 1
3. PWA appends a 🌮 to their team name for the entire next week

---

## Rule 5: 3-Strike Rename

**Target:** Teams on a 3+ game losing streak.

**Execution:**
1. Trigger or cron counts consecutive losses per team
2. If `loss_streak >= 3`, update `team_name_override` to `"The [Adjective] Pigeons"`
3. Random adjectives: Soggy, Wobbly, Confused, Limping, Perplexed, Damp, Shivering
4. Override persists until they win a game
5. PWA displays the override name instead of the team's chosen name

---

## Rule 6: Morale Multiplier

**Target:** All teams, based on win/loss margin.

**Execution:**
1. **Win** → morale += 5
2. **Loss by 30+** → morale -= 15
3. **Loss by < 30** → morale -= 5
4. Morale clamped to [0, 100]
5. During scoring: `final_score += CASE WHEN morale > 70 THEN 2 WHEN morale < 30 THEN -3 ELSE 0 END`

---

## Announcement System

When a chaos event fires, an announcement record is created. The PWA polls `/api/chaos/announcements` every 60s. When a new announcement is found, it displays a full-screen modal.

**Announcement types:**
- `clown_car` — "🤡 [Team] has been Clown Carred! [Player] forced into lineup!"
- `hex` — "🔮 [Team] is HEXED! Opponent gets +3!"
- `steal` — "🫳 [Team] stole [Player] from [Team]!"
- `taco` — "🌮 [Team] won the Taco Trophy!"
- `rename` — "🕊️ [Team] is now The [Adjective] Pigeons!"

---

## Reference

- [`SCORING-GUIDE.md`](SCORING-GUIDE.md) — scoring engine
- [`DATABASE-GUIDE.md`](DATABASE-GUIDE.md) — schema
- [`API-GUIDE.md`](API-GUIDE.md) — chaos endpoints
