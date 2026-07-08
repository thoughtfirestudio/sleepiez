-- Sleepiez — Seed data: Sleepy Joezzz league
-- 6 teams, 0.5 PPR, default chaos config (all disabled)

-- ============================================================
-- LEAGUE
-- ============================================================
INSERT INTO leagues (id, name, season, sleeper_league_id, league_config, roster_size, starters_count, scoring_type, waiver_budget)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Sleepy Joezzz',
  2026,
  NULL,
  '{
    "clown_car_enabled": false,
    "clown_car_threshold": 20,
    "hex_enabled": false,
    "steal_a_player_enabled": false,
    "taco_trophy_enabled": false,
    "morale_multiplier_enabled": false,
    "auto_rename_enabled": false
  }'::jsonb,
  15,
  9,
  'ppr',
  100
);

-- ============================================================
-- USERS + TEAMS (placeholder names — they can change when they join)
-- ============================================================
-- Each user gets a placeholder email + display name and a team.

-- Adam
INSERT INTO users (id, email, display_name, is_admin)
VALUES ('a1000000-0000-0000-0000-000000000001', 'adam@sleepiez.com', 'Adam', false);
INSERT INTO teams (id, league_id, user_id, name, abbreviation, waiver_rank, faab_remaining, wins, losses, ties, total_points, morale)
VALUES ('b1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Adambassadors', 'ADM', 1, 100, 0, 0, 0, 0.0, 50);
INSERT INTO rosters (team_id, starters, bench) VALUES ('b1000000-0000-0000-0000-000000000001', '[]'::jsonb, '[]'::jsonb);

-- Brandon
INSERT INTO users (id, email, display_name, is_admin)
VALUES ('a2000000-0000-0000-0000-000000000002', 'brandon@sleepiez.com', 'Brandon', false);
INSERT INTO teams (id, league_id, user_id, name, abbreviation, waiver_rank, faab_remaining, wins, losses, ties, total_points, morale)
VALUES ('b2000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Brandos', 'BRN', 2, 100, 0, 0, 0, 0.0, 50);
INSERT INTO rosters (team_id, starters, bench) VALUES ('b2000000-0000-0000-0000-000000000002', '[]'::jsonb, '[]'::jsonb);

-- David
INSERT INTO users (id, email, display_name, is_admin)
VALUES ('a3000000-0000-0000-0000-000000000003', 'david@sleepiez.com', 'David', true);
INSERT INTO teams (id, league_id, user_id, name, abbreviation, waiver_rank, faab_remaining, wins, losses, ties, total_points, morale)
VALUES ('b3000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'Dune Coast Marauders', 'DCM', 3, 100, 0, 0, 0, 0.0, 50);
INSERT INTO rosters (team_id, starters, bench) VALUES ('b3000000-0000-0000-0000-000000000003', '[]'::jsonb, '[]'::jsonb);

-- Dillon
INSERT INTO users (id, email, display_name, is_admin)
VALUES ('a4000000-0000-0000-0000-000000000004', 'dillon@sleepiez.com', 'Dillon', false);
INSERT INTO teams (id, league_id, user_id, name, abbreviation, waiver_rank, faab_remaining, wins, losses, ties, total_points, morale)
VALUES ('b4000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'a4000000-0000-0000-0000-000000000004', 'Dillons Demons', 'DIL', 4, 100, 0, 0, 0, 0.0, 50);
INSERT INTO rosters (team_id, starters, bench) VALUES ('b4000000-0000-0000-0000-000000000004', '[]'::jsonb, '[]'::jsonb);

-- Dylan
INSERT INTO users (id, email, display_name, is_admin)
VALUES ('a5000000-0000-0000-0000-000000000005', 'dylan@sleepiez.com', 'Dylan', false);
INSERT INTO teams (id, league_id, user_id, name, abbreviation, waiver_rank, faab_remaining, wins, losses, ties, total_points, morale)
VALUES ('b5000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'a5000000-0000-0000-0000-000000000005', 'Dylans Ducks', 'DYL', 5, 100, 0, 0, 0, 0.0, 50);
INSERT INTO rosters (team_id, starters, bench) VALUES ('b5000000-0000-0000-0000-000000000005', '[]'::jsonb, '[]'::jsonb);

-- Gavin
INSERT INTO users (id, email, display_name, is_admin)
VALUES ('a6000000-0000-0000-0000-000000000006', 'gavin@sleepiez.com', 'Gavin', false);
INSERT INTO teams (id, league_id, user_id, name, abbreviation, waiver_rank, faab_remaining, wins, losses, ties, total_points, morale)
VALUES ('b6000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'a6000000-0000-0000-0000-000000000006', 'Gavins Goats', 'GVN', 6, 100, 0, 0, 0, 0.0, 50);
INSERT INTO rosters (team_id, starters, bench) VALUES ('b6000000-0000-0000-0000-000000000006', '[]'::jsonb, '[]'::jsonb);
