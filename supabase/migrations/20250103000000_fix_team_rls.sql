-- Allow authenticated users to create teams
-- (Ideally we check if they are a member, but for now allow auth users to insert)
drop policy if exists "Users can create teams" on fantasy_teams;
create policy "Users can create teams" on fantasy_teams for insert with check (auth.role() = 'authenticated');

-- Allow users to update their own teams
drop policy if exists "Users can update own team" on fantasy_teams;
create policy "Users can update own team" on fantasy_teams for update using (auth.uid() = user_id);

-- Start Matchups RLS Fixes (so scores can be updated) --
-- Allow commissioners to update matchups (scores)
drop policy if exists "Commissioners can update matchups" on fantasy_matchups;
create policy "Commissioners can update matchups" on fantasy_matchups for update using (
    exists (
        select 1 from fantasy_league_members
        where league_id = fantasy_matchups.league_id
        and user_id = auth.uid()
        and role = 'commissioner'
    )
);
