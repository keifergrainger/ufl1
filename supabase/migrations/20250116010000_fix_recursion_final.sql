-- Migration: 20250116010000_fix_recursion_final.sql
-- Description: Fix infinite recursion in RLS policies and ensure league creators can view their leagues.

-- 1. DROP the recursive "FOR ALL" policies on fantasy_league_members
-- These were created in 20250105 and 20250102 migrations and cause the SELECT -> SELECT loop.
DROP POLICY IF EXISTS "Commissioners can update league members" ON fantasy_league_members;
DROP POLICY IF EXISTS "League creators can manage members" ON fantasy_league_members;

-- 2. Update fantasy_leagues SELECT Policy to be simpler and inclusive of params
-- This fixes the issue where a Creator cannot see the league they just inserted (before they are a member).
-- It also performs the 'created_by' check optimistically to avoid the subquery if possible.

DROP POLICY IF EXISTS "Members can view their private leagues" ON fantasy_leagues;

CREATE POLICY "Members can view their private leagues" 
ON fantasy_leagues FOR SELECT 
TO authenticated 
USING (
    created_by = auth.uid() OR -- Fast check, allows creator to see immediately
    auth.uid() IN (
        SELECT user_id FROM fantasy_league_members WHERE league_id = id
    )
);

-- 3. Restore specific permissions for Commissioners on Members table if needed (Update only)
-- We already have "Commissioners can remove members" (DELETE) from 20250115.
-- We add UPDATE just in case (e.g. promoting others).
-- This uses EXISTS but only for UPDATE, so it won't be triggered by SELECTs, breaking the loop.

CREATE POLICY "Commissioners can update members"
ON fantasy_league_members FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM fantasy_leagues
        WHERE id = fantasy_league_members.league_id
        AND created_by = auth.uid()
    )
);
