-- Upgrade Fantasy Schema for Production Features

-- 1. Upgrade fantasy_leagues
alter table fantasy_leagues 
add column if not exists league_code text unique,
add column if not exists max_teams int not null default 10,
add column if not exists current_week int not null default 1,
add column if not exists auto_generated boolean not null default true;

-- 2. Upgrade fantasy_teams
alter table fantasy_teams
add column if not exists is_claimed boolean not null default false;

-- 3. RLS Updates for claiming teams
-- Allow users to update a team if they are claiming it (setting user_id to themselves when it is null)
create policy "Users can claim unclaimed teams" on fantasy_teams
for update
using (
  user_id is null 
  and is_claimed = false
)
with check (
  auth.uid() = user_id 
  and is_claimed = true
);

-- 4. Commissioner RLS Enhancements
-- Allow commissioners to update anything in their league
create policy "Commissioners can update leagues" on fantasy_leagues
for update
using (auth.uid() = created_by);

create policy "Commissioners can update league members" on fantasy_league_members
for all
using (
  exists (
    select 1 from fantasy_leagues
    where id = fantasy_league_members.league_id
    and created_by = auth.uid()
  )
);

create policy "Commissioners can update teams" on fantasy_teams
for all
using (
  exists (
    select 1 from fantasy_leagues
    where id = fantasy_teams.league_id
    and created_by = auth.uid()
  )
);

create policy "Commissioners can update matchups" on fantasy_matchups
for all
using (
  exists (
    select 1 from fantasy_leagues
    where id = fantasy_matchups.league_id
    and created_by = auth.uid()
  )
);

create policy "Commissioners can update draft picks" on fantasy_draft_picks
for all
using (
  exists (
    select 1 from fantasy_leagues
    where id = fantasy_draft_picks.league_id
    and created_by = auth.uid()
  )
);
