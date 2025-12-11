-- 1. UFL Teams (Real Franchises)
create table if not exists ufl_teams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,            -- e.g. 'bham-stallions'
  name text not null,                   -- e.g. 'Birmingham Stallions'
  city text,
  primary_color text,
  secondary_color text,
  logo_url text,
  created_at timestamptz default now()
);

-- 2. Players (Real Players)
-- Check if table exists, if so extend it; otherwise create it.
do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'players') then
    create table players (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      position text not null,
      ufl_team_id uuid references ufl_teams(id),
      headshot_url text,
      is_active boolean not null default true,
      created_at timestamptz default now()
    );
  else
    -- Add columns if they don't exist
    if not exists (select from information_schema.columns where table_name = 'players' and column_name = 'ufl_team_id') then
      alter table players add column ufl_team_id uuid references ufl_teams(id);
    end if;
    if not exists (select from information_schema.columns where table_name = 'players' and column_name = 'position') then
      alter table players add column position text; -- nullable initially if data exists
    end if;
    if not exists (select from information_schema.columns where table_name = 'players' and column_name = 'is_active') then
      alter table players add column is_active boolean not null default true;
    end if;
  end if;
end
$$;

-- 3. Fantasy Leagues
create table if not exists fantasy_leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  primary_ufl_team_id uuid references ufl_teams(id),
  season_year int not null,
  is_public boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 4. League Membership
create table if not exists fantasy_league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references fantasy_leagues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('commissioner','member')),
  created_at timestamptz default now(),
  unique (league_id, user_id)
);

-- 5. Fantasy Teams
create table if not exists fantasy_teams (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references fantasy_leagues(id) on delete cascade,
  user_id uuid references auth.users(id),   -- allow null for demo/ghost teams
  name text not null,
  avatar_url text,
  wins int not null default 0,
  losses int not null default 0,
  ties int not null default 0,
  points_for numeric(8,2) not null default 0,
  points_against numeric(8,2) not null default 0,
  created_at timestamptz default now()
);

-- 6. Fantasy Weeks
create table if not exists fantasy_weeks (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references fantasy_leagues(id) on delete cascade,
  label text not null,
  week_number int not null,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

-- 7. Matchups
create table if not exists fantasy_matchups (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references fantasy_leagues(id) on delete cascade,
  week_id uuid not null references fantasy_weeks(id) on delete cascade,
  home_team_id uuid not null references fantasy_teams(id),
  away_team_id uuid not null references fantasy_teams(id),
  home_score numeric(8,2) not null default 0,
  away_score numeric(8,2) not null default 0,
  created_at timestamptz default now()
);

-- 8. Rosters
create table if not exists fantasy_rosters (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references fantasy_teams(id) on delete cascade,
  player_id uuid not null references players(id),
  slot text,
  created_at timestamptz default now(),
  unique (team_id, player_id)
);

-- 9. Draft Picks
create table if not exists fantasy_draft_picks (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references fantasy_leagues(id) on delete cascade,
  round int not null,
  pick_in_round int not null,
  overall_pick int not null,
  team_id uuid not null references fantasy_teams(id),
  player_id uuid references players(id), -- nullable until picked
  created_at timestamptz default now(),
  unique (league_id, overall_pick)
);

-- 10. League Settings
create table if not exists fantasy_settings (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references fantasy_leagues(id) on delete cascade,
  scoring_json jsonb,
  roster_template_json jsonb,
  draft_type text not null default 'snake' check (draft_type in ('snake','auction')),
  created_at timestamptz default now()
);

-- RLS Policies (Basic)
alter table fantasy_leagues enable row level security;
alter table fantasy_league_members enable row level security;
alter table fantasy_teams enable row level security;
alter table fantasy_matchups enable row level security;
alter table fantasy_rosters enable row level security;
alter table fantasy_draft_picks enable row level security;

-- Public read access for most everything (transparency)
create policy "Public leagues are viewable by everyone" on fantasy_leagues for select using (true);
create policy "Public teams are viewable by everyone" on fantasy_teams for select using (true);
create policy "Public matchups are viewable by everyone" on fantasy_matchups for select using (true);
create policy "Public rosters are viewable by everyone" on fantasy_rosters for select using (true);
create policy "Public draft picks are viewable by everyone" on fantasy_draft_picks for select using (true);

-- Member RLS
create policy "Users can see their own memberships" on fantasy_league_members for select using (auth.uid() = user_id);

-- TODO: Add strict write policies later. For now, rely on API layer checks or comprehensive Admin policies.
-- Assuming admins are handled via service role or separate admin claims in a real app.
