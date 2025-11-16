/*
  # Optimize RLS Policies for Better Performance

  1. Changes
    - Replace all `auth.uid()` calls with `(select auth.uid())` in RLS policies
    - This prevents re-evaluation of auth.uid() for each row
    - Applies to all tables: profiles, teams, team_members, match_reflections, training_records, goals
    
  2. Performance Impact
    - Significantly improves query performance at scale
    - Auth function is called once per query instead of once per row
    - Recommended best practice by Supabase
*/

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Teams table policies
DROP POLICY IF EXISTS "Team creators can view their teams" ON teams;
DROP POLICY IF EXISTS "Users can insert teams" ON teams;
DROP POLICY IF EXISTS "Team creators can update their teams" ON teams;
DROP POLICY IF EXISTS "Team creators can delete their teams" ON teams;

CREATE POLICY "Team creators can view their teams"
  ON teams FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = created_by);

CREATE POLICY "Users can insert teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Team creators can update their teams"
  ON teams FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = created_by)
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Team creators can delete their teams"
  ON teams FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = created_by);

-- Team members table policies
DROP POLICY IF EXISTS "Users can view own team members" ON team_members;
DROP POLICY IF EXISTS "Users can insert own team members" ON team_members;
DROP POLICY IF EXISTS "Users can update own team members" ON team_members;
DROP POLICY IF EXISTS "Users can delete own team members" ON team_members;

CREATE POLICY "Users can view own team members"
  ON team_members FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own team members"
  ON team_members FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Match reflections table policies
DROP POLICY IF EXISTS "Users can view own match reflections" ON match_reflections;
DROP POLICY IF EXISTS "Users can insert own match reflections" ON match_reflections;
DROP POLICY IF EXISTS "Users can update own match reflections" ON match_reflections;
DROP POLICY IF EXISTS "Users can delete own match reflections" ON match_reflections;

CREATE POLICY "Users can view own match reflections"
  ON match_reflections FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own match reflections"
  ON match_reflections FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own match reflections"
  ON match_reflections FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own match reflections"
  ON match_reflections FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Training records table policies
DROP POLICY IF EXISTS "Users can view own training records" ON training_records;
DROP POLICY IF EXISTS "Users can insert own training records" ON training_records;
DROP POLICY IF EXISTS "Users can update own training records" ON training_records;
DROP POLICY IF EXISTS "Users can delete own training records" ON training_records;

CREATE POLICY "Users can view own training records"
  ON training_records FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own training records"
  ON training_records FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own training records"
  ON training_records FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own training records"
  ON training_records FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Goals table policies
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;

CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);