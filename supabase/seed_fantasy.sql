-- Helper to get IDs (variables in SQL blocks)

do $$
declare
  -- Variables prefixed with v_ to avoid "ambiguous column reference" errors
  v_stallions_id uuid;
  v_aviators_id uuid;
  v_renegades_id uuid;
  v_defenders_id uuid;
  v_gamblers_id uuid;
  v_kings_id uuid;
  v_storm_id uuid;
  v_battlehawks_id uuid;
  
  v_league_id uuid;
  t1_id uuid; t2_id uuid; t3_id uuid; t4_id uuid;
  t5_id uuid; t6_id uuid; t7_id uuid; t8_id uuid;
  
  w1_id uuid; w2_id uuid; w3_id uuid;
  
  -- Players
  qb_corral uuid; qb_martinez uuid;
  rb_scarb uuid; rb_marable uuid;
  wr_stern uuid; wr_cain uuid;
  te_ace uuid;
  
begin
  -- 1. Insert UFL Teams (Custom List from User Image)
  
  -- Birmingham Stallions
  insert into ufl_teams (name, slug, city, primary_color, secondary_color) values
  ('Birmingham Stallions', 'bham-stallions', 'Birmingham', '#a51417', '#B0B7BC') 
  on conflict (slug) do update set name = excluded.name, primary_color = excluded.primary_color
  returning id into v_stallions_id;
  
  -- Columbus Aviators
  insert into ufl_teams (name, slug, city, primary_color, secondary_color) values
  ('Columbus Aviators', 'col-aviators', 'Columbus', '#001f3f', '#ffffff')
  on conflict (slug) do update set name = excluded.name, primary_color = excluded.primary_color
  returning id into v_aviators_id;

  -- Dallas Renegades
  insert into ufl_teams (name, slug, city, primary_color, secondary_color) values
  ('Dallas Renegades', 'dal-renegades', 'Dallas', '#6399bb', '#000000')
  on conflict (slug) do update set name = excluded.name, primary_color = excluded.primary_color
  returning id into v_renegades_id;

  -- DC Defenders
  insert into ufl_teams (name, slug, city, primary_color, secondary_color) values
  ('DC Defenders', 'dc-defenders', 'Washington D.C.', '#CE1126', '#ffffff')
  on conflict (slug) do update set name = excluded.name, primary_color = excluded.primary_color
  returning id into v_defenders_id;

  -- Houston Gamblers
  insert into ufl_teams (name, slug, city, primary_color, secondary_color) values
  ('Houston Gamblers', 'hou-gamblers', 'Houston', '#000000', '#FDBB30')
  on conflict (slug) do update set name = excluded.name, primary_color = excluded.primary_color
  returning id into v_gamblers_id;

  -- Louisville Kings
  insert into ufl_teams (name, slug, city, primary_color, secondary_color) values
  ('Louisville Kings', 'lou-kings', 'Louisville', '#1a3c34', '#d4af37')
  on conflict (slug) do update set name = excluded.name, primary_color = excluded.primary_color
  returning id into v_kings_id;

  -- Orlando Storm
  insert into ufl_teams (name, slug, city, primary_color, secondary_color) values
  ('Orlando Storm', 'orl-storm', 'Orlando', '#ff5200', '#002C5F')
  on conflict (slug) do update set name = excluded.name, primary_color = excluded.primary_color
  returning id into v_storm_id;

  -- St. Louis Battlehawks
  insert into ufl_teams (name, slug, city, primary_color, secondary_color) values
  ('St. Louis Battlehawks', 'stl-battlehawks', 'St. Louis', '#005AC6', '#A4A9AD')
  on conflict (slug) do update set name = excluded.name, primary_color = excluded.primary_color
  returning id into v_battlehawks_id;


  -- 2. Insert Players (Stallions subset for demo)
  -- Clean up old demo players to avoid duplicates if re-running
  delete from players where name in ('Matt Corral','Adrian Martinez','CJ Marable','Bo Scarbrough','Jace Sternberger','Deon Cain','Marlon Williams');

  insert into players (name, position, ufl_team_id) values
  ('Matt Corral', 'QB', v_stallions_id) returning id into qb_corral;
  insert into players (name, position, ufl_team_id) values
  ('Adrian Martinez', 'QB', v_stallions_id) returning id into qb_martinez;
  insert into players (name, position, ufl_team_id) values
  ('CJ Marable', 'RB', v_stallions_id) returning id into rb_marable;
  insert into players (name, position, ufl_team_id) values
  ('Bo Scarbrough', 'RB', v_stallions_id) returning id into rb_scarb;
  insert into players (name, position, ufl_team_id) values
  ('Jace Sternberger', 'TE', v_stallions_id) returning id into te_ace;
  insert into players (name, position, ufl_team_id) values
  ('Deon Cain', 'WR', v_stallions_id) returning id into wr_cain;
  insert into players (name, position, ufl_team_id) values
  ('Marlon Williams', 'WR', v_stallions_id) returning id into wr_stern; 
  
  -- Add generic players
  insert into players (name, position, ufl_team_id) values ('Hayes Ruler', 'QB', v_kings_id);
  insert into players (name, position, ufl_team_id) values ('Stormy Weathers', 'QB', v_storm_id);
  insert into players (name, position, ufl_team_id) values ('Ace Gamble', 'QB', v_gamblers_id);
  insert into players (name, position, ufl_team_id) values ('Sky Captain', 'QB', v_aviators_id);

  -- 3. Create Demo League
  -- Check if exists
  select id into v_league_id from fantasy_leagues where name = 'Official Stallions Demo League' limit 1;
  
  if v_league_id is null then
      insert into fantasy_leagues (name, description, primary_ufl_team_id, season_year, is_public)
      values ('Official Stallions Demo League', 'The premier fantasy league for Bham fans.', v_stallions_id, 2024, true)
      returning id into v_league_id;
  end if;

  -- 4. Create Fantasy Teams (Reset for demo)
  delete from fantasy_teams where league_id = v_league_id;

  insert into fantasy_teams (league_id, name, wins, losses, ties, points_for, points_against) values
  (v_league_id, 'Stallions Nation', 2, 0, 0, 245.50, 180.00) returning id into t1_id;
  
  insert into fantasy_teams (league_id, name, wins, losses, ties, points_for, points_against) values
  (v_league_id, 'Magic City Maulers', 1, 1, 0, 210.20, 215.00) returning id into t2_id;
  
  insert into fantasy_teams (league_id, name, wins, losses, ties, points_for, points_against) values
  (v_league_id, 'King Slayers', 0, 2, 0, 150.00, 280.00) returning id into t3_id;
  
  insert into fantasy_teams (league_id, name, wins, losses, ties, points_for, points_against) values
  (v_league_id, 'Storm Chasers', 1, 1, 0, 199.90, 200.00) returning id into t4_id;
  
  insert into fantasy_teams (league_id, name, wins, losses, ties, points_for, points_against) values
  (v_league_id, 'Renegade Masters', 2, 0, 0, 260.00, 150.00) returning id into t5_id;
  
  insert into fantasy_teams (league_id, name, wins, losses, ties, points_for, points_against) values
  (v_league_id, 'Gamblin Men', 0, 2, 0, 170.50, 230.00) returning id into t6_id;
  
  insert into fantasy_teams (league_id, name, wins, losses, ties, points_for, points_against) values
  (v_league_id, 'Aviator Aces', 1, 1, 0, 205.00, 205.00) returning id into t7_id;
  
  insert into fantasy_teams (league_id, name, wins, losses, ties, points_for, points_against) values
  (v_league_id, 'Battlehawk Down', 1, 1, 0, 222.00, 190.00) returning id into t8_id;

  -- 5. Create Weeks (Delete old first)
  delete from fantasy_weeks where league_id = v_league_id;

  -- Week 1 (Past)
  insert into fantasy_weeks (league_id, label, week_number, start_date, end_date)
  values (v_league_id, 'Week 1', 1, now() - interval '14 days', now() - interval '7 days')
  returning id into w1_id;
  
  -- Week 2 (Past/Current)
  insert into fantasy_weeks (league_id, label, week_number, start_date, end_date)
  values (v_league_id, 'Week 2', 2, now() - interval '6 days', now())
  returning id into w2_id;
  
  -- Week 3 (Future)
  insert into fantasy_weeks (league_id, label, week_number, start_date, end_date)
  values (v_league_id, 'Week 3', 3, now() + interval '1 day', now() + interval '8 days')
  returning id into w3_id;

  -- 6. Create Matchups (Week 2 - "Current")
  -- T1 vs T2
  insert into fantasy_matchups (league_id, week_id, home_team_id, away_team_id, home_score, away_score)
  values (v_league_id, w2_id, t1_id, t2_id, 120.50, 110.00);
  
  -- T3 vs T4
  insert into fantasy_matchups (league_id, week_id, home_team_id, away_team_id, home_score, away_score)
  values (v_league_id, w2_id, t3_id, t4_id, 80.00, 95.50);
  
  -- T5 vs T6
  insert into fantasy_matchups (league_id, week_id, home_team_id, away_team_id, home_score, away_score)
  values (v_league_id, w2_id, t5_id, t6_id, 130.00, 85.00);
  
  -- T7 vs T8
  insert into fantasy_matchups (league_id, week_id, home_team_id, away_team_id, home_score, away_score)
  values (v_league_id, w2_id, t7_id, t8_id, 100.00, 105.00);

  -- 7. Seed Rosters (Partial)
  insert into fantasy_rosters (team_id, player_id, slot) values (t1_id, qb_martinez, 'QB');
  insert into fantasy_rosters (team_id, player_id, slot) values (t1_id, rb_scarb, 'RB');
  insert into fantasy_rosters (team_id, player_id, slot) values (t1_id, te_ace, 'TE');
  insert into fantasy_rosters (team_id, player_id, slot) values (t1_id, wr_cain, 'WR');

  insert into fantasy_rosters (team_id, player_id, slot) values (t2_id, qb_corral, 'QB');
  insert into fantasy_rosters (team_id, player_id, slot) values (t2_id, rb_marable, 'RB');

end
$$;
