-- Allow commissioners to manage draft picks (INSERT, UPDATE, DELETE)

-- DELETE
drop policy if exists "Commissioners can delete draft picks" on fantasy_draft_picks;
create policy "Commissioners can delete draft picks" on fantasy_draft_picks for delete using (
    exists (
        select 1 from fantasy_league_members
        where league_id = fantasy_draft_picks.league_id
        and user_id = auth.uid()
        and role = 'commissioner'
    )
);

-- INSERT
drop policy if exists "Commissioners can insert draft picks" on fantasy_draft_picks;
create policy "Commissioners can insert draft picks" on fantasy_draft_picks for insert with check (
    exists (
        select 1 from fantasy_league_members
        where league_id = fantasy_draft_picks.league_id
        and user_id = auth.uid()
        and role = 'commissioner'
    )
);

-- UPDATE (e.g. for making picks)
drop policy if exists "Commissioners can update draft picks" on fantasy_draft_picks;
create policy "Commissioners can update draft picks" on fantasy_draft_picks for update using (
    exists (
        select 1 from fantasy_league_members
        where league_id = fantasy_draft_picks.league_id
        and user_id = auth.uid()
        and role = 'commissioner'
    )
);
