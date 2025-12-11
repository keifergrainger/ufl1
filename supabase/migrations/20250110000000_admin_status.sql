-- Add status column to fantasy_leagues for admin archiving
alter table fantasy_leagues 
add column if not exists status text not null default 'active' check (status in ('active', 'archived'));
