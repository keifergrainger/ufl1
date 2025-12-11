-- Ensure Public Select for Teams
drop policy if exists "Public teams are viewable by everyone" on fantasy_teams;
create policy "Public teams are viewable by everyone" on fantasy_teams for select using (true);

-- Also ensure members can read (redundant but safe)
drop policy if exists "Members can view teams" on fantasy_teams;
create policy "Members can view teams" on fantasy_teams for select using (true);
