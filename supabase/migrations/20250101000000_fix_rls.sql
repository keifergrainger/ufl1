-- Allow authenticated users to create leagues
create policy "Users can create leagues" on fantasy_leagues for insert with check (auth.role() = 'authenticated');

-- Allow authenticated users to join leagues (insert into members)
create policy "Users can join leagues" on fantasy_league_members for insert with check (auth.role() = 'authenticated');

-- Allow users to update their own leagues (e.g. settings)
create policy "Commissioners can update their leagues" on fantasy_leagues for update using (
    exists (
        select 1 from fantasy_league_members
        where league_id = fantasy_leagues.id
        and user_id = auth.uid()
        and role = 'commissioner'
    )
);

-- Allow commissioners to manage members (e.g. update roles, remove members)
create policy "Commissioners can manage members" on fantasy_league_members for all using (
    exists (
        select 1 from fantasy_league_members as admin_check
        where admin_check.league_id = fantasy_league_members.league_id
        and admin_check.user_id = auth.uid()
        and admin_check.role = 'commissioner'
    )
);
