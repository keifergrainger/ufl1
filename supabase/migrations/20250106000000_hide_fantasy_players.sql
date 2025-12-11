-- Add flag to distinguish fantasy demo players from real roster
alter table players add column if not exists is_fantasy_only boolean default false;

-- Update the generic/demo players to be hidden
update players 
set is_fantasy_only = true 
where name in (
  'Hayes Ruler', 'Stormy Weathers', 'Ace Gamble', 'Sky Captain', -- Generics
  'Matt Corral', 'Adrian Martinez', 'CJ Marable', 'Bo Scarbrough', 'Jace Sternberger', 'Deon Cain', 'Marlon Williams' -- Demo Stallions
);
