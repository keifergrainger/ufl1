-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE fantasy_league_members ENABLE ROW LEVEL SECURITY;

-- 1. Site Settings
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
CREATE POLICY "Public can view site settings" 
ON site_settings FOR SELECT 
TO public 
USING (true);

-- 2. News Articles
DROP POLICY IF EXISTS "Public can view news" ON news_articles;
CREATE POLICY "Public can view news" 
ON news_articles FOR SELECT 
TO public 
USING (true);

-- 3. Players
DROP POLICY IF EXISTS "Public can view players" ON players;
CREATE POLICY "Public can view players" 
ON players FOR SELECT 
TO public 
USING (true);

-- 4. Fantasy Leagues
DROP POLICY IF EXISTS "Public leagues are viewable by everyone" ON fantasy_leagues;
CREATE POLICY "Public leagues are viewable by everyone" 
ON fantasy_leagues FOR SELECT 
TO public 
USING (is_public = true);

DROP POLICY IF EXISTS "Members can view their private leagues" ON fantasy_leagues;
CREATE POLICY "Members can view their private leagues" 
ON fantasy_leagues FOR SELECT 
TO authenticated 
USING (
    auth.uid() IN (
        SELECT user_id FROM fantasy_league_members WHERE league_id = id
    )
);

DROP POLICY IF EXISTS "Users can create leagues" ON fantasy_leagues;
CREATE POLICY "Users can create leagues" 
ON fantasy_leagues FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Commissioners can update their leagues" ON fantasy_leagues;
CREATE POLICY "Commissioners can update their leagues" 
ON fantasy_leagues FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Commissioners can delete their leagues" ON fantasy_leagues;
CREATE POLICY "Commissioners can delete their leagues" 
ON fantasy_leagues FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);


-- 5. Fantasy Teams
DROP POLICY IF EXISTS "Authenticated users can view teams" ON fantasy_teams;
CREATE POLICY "Authenticated users can view teams" 
ON fantasy_teams FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Users can create their own team" ON fantasy_teams;
CREATE POLICY "Users can create their own team" 
ON fantasy_teams FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can update their team" ON fantasy_teams;
CREATE POLICY "Owners can update their team" 
ON fantasy_teams FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can delete their team" ON fantasy_teams;
CREATE POLICY "Owners can delete their team" 
ON fantasy_teams FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);


-- 6. Fantasy League Members
DROP POLICY IF EXISTS "League members are viewable" ON fantasy_league_members;
CREATE POLICY "League members are viewable" 
ON fantasy_league_members FOR SELECT 
TO authenticated 
USING (true); 

DROP POLICY IF EXISTS "Users can join leagues" ON fantasy_league_members;
CREATE POLICY "Users can join leagues" 
ON fantasy_league_members FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave leagues" ON fantasy_league_members;
CREATE POLICY "Users can leave leagues" 
ON fantasy_league_members FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Commissioners can remove members" ON fantasy_league_members;
CREATE POLICY "Commissioners can remove members" 
ON fantasy_league_members FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM fantasy_leagues 
        WHERE id = fantasy_league_members.league_id 
        AND created_by = auth.uid()
    )
);
