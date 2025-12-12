-- Migration: 20250116000000_live_draft.sql
-- Description: Add support for live drafting (draft status, manual picks)

-- 1. Extend fantasy_leagues
ALTER TABLE fantasy_leagues
ADD COLUMN IF NOT EXISTS draft_type text DEFAULT 'live', -- 'live' | 'auto'
ADD COLUMN IF NOT EXISTS draft_status text DEFAULT 'pending', -- 'pending' | 'in_progress' | 'complete'
ADD COLUMN IF NOT EXISTS current_pick_overall integer DEFAULT 1;

-- 2. Extend fantasy_draft_picks
ALTER TABLE fantasy_draft_picks
ADD COLUMN IF NOT EXISTS player_id uuid REFERENCES players(id),
ADD COLUMN IF NOT EXISTS picked_at timestamptz;

-- 3. Add Index for performance
CREATE INDEX IF NOT EXISTS fantasy_draft_picks_league_overall_idx
ON fantasy_draft_picks (league_id, overall_pick);

-- 4. RLS Security Check (comments only, logic is in server action/RLS files)
-- Existing RLS policies on fantasy_leagues and fantasy_draft_picks allow public read
-- or member read, which is fine.
-- Write access is restricted to service role or commissioner via policies.
-- Server actions will handle the "is it my turn" specific logic.
