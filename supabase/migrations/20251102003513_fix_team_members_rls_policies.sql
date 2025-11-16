/*
  # Fix Team Members RLS Policies

  1. Changes
    - Drop existing restrictive policies that require teams table
    - Add new policies that allow users to manage their own team members directly
    - Users can insert, select, update, and delete their own team members using user_id
    
  2. Security
    - Users can only access team members where user_id matches their auth.uid()
    - All operations (SELECT, INSERT, UPDATE, DELETE) are restricted to own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Team members can view team membership" ON team_members;
DROP POLICY IF EXISTS "Team admins can insert members" ON team_members;
DROP POLICY IF EXISTS "Team admins can update members" ON team_members;
DROP POLICY IF EXISTS "Team admins can delete members" ON team_members;

-- Create new simple policies based on user_id
CREATE POLICY "Users can view own team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);