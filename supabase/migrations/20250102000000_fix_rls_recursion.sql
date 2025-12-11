-- Drop the recursive policy from 20250101 migration
drop policy if exists "Commissioners can manage members" on fantasy_league_members;

-- Create a non-recursive policy: League Creators (owners) can manage members.
-- This queries 'fantasy_leagues' instead of 'fantasy_league_members', breaking the loop.
create policy "League creators can manage members" on fantasy_league_members for all using (
    exists (
        select 1 from fantasy_leagues
        where id = fantasy_league_members.league_id
        and created_by = auth.uid()
    )
);

-- Note: We trust that the 'fantasy_leagues' SELECT policy is non-recursive (it's public/true),
-- so this cross-table check is safe.
