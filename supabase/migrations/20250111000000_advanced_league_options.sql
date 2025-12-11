-- Add advanced options to fantasy_leagues
alter table fantasy_leagues 
add column if not exists draft_type text default 'auto',
add column if not exists scoring_preset text default 'default';

-- Ensure description exists (it might from base schema but good to be safe)
alter table fantasy_leagues 
add column if not exists description text;

-- Ensure is_public exists
alter table fantasy_leagues
add column if not exists is_public boolean default false;
