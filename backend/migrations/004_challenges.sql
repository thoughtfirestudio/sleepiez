-- Pre-draft challenge system
-- Each week a challenge goes live, homies submit answers, get scored.
-- Cumulative score determines draft order.

CREATE TABLE IF NOT EXISTS challenges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INTEGER NOT NULL,
    title       VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    questions   JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{question, options: [], correct_index: N}]
    opens_at    TIMESTAMPTZ NOT NULL,
    closes_at   TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_submissions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id),
    user_id      UUID NOT NULL REFERENCES users(id),
    answers      JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [selected_index, ...]
    score        INTEGER DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_challenges_week ON challenges(week_number);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON challenge_submissions(challenge_id);
