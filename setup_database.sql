-- =====================================================
-- Complete Database Setup for Soccer Training App
-- =====================================================
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/houwvsbzbvmsitapodms/sql
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: Create Tables
-- =====================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  team_name text,
  position text,
  strengths text[],
  weaknesses text[],
  favorite_player text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_date date,
  achieved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Training records table
CREATE TABLE IF NOT EXISTS training_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  duration integer, -- in minutes
  training_type text,
  content text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Match reflections table
CREATE TABLE IF NOT EXISTS match_reflections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  match_date date NOT NULL,
  opponent text,
  result text,
  reflection text,
  good_points text,
  improvement_points text,
  video_url text,
  ai_analysis text,
  analysis_status text CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text DEFAULT '',
  position text DEFAULT '',
  characteristics text DEFAULT '',
  jersey_number integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'inactive',
  plan_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- STEP 2: Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: Create RLS Policies
-- =====================================================

-- Profiles policies
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

-- Goals policies
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

-- Training records policies
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

-- Match reflections policies
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

-- Team members policies
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

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- STEP 4: Create Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_training_records_user_id ON training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_training_records_date ON training_records(date);
CREATE INDEX IF NOT EXISTS idx_match_reflections_user_id ON match_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_match_reflections_date ON match_reflections(match_date);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- =====================================================
-- STEP 5: Create Storage Bucket for Match Videos
-- =====================================================

-- Create storage bucket for match videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('match-videos', 'match-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload own match videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own match videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own match videos" ON storage.objects;

-- Set up storage policies for match videos
CREATE POLICY "Users can upload own match videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'match-videos' AND
  (select auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own match videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'match-videos' AND
  (select auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own match videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'match-videos' AND
  (select auth.uid())::text = (storage.foldername(name))[1]
);

-- =====================================================
-- Setup Complete!
-- =====================================================
-- Your database is now ready to use.
-- =====================================================
