/*
  # Add Video Support to Match Reflections

  1. Changes
    - Add `video_url` column to store Supabase Storage video URLs
    - Add `ai_analysis` column to store AI-generated analysis results
    - Add `analysis_status` column to track analysis progress (pending, processing, completed, failed)
    
  2. Notes
    - Videos will be stored in Supabase Storage
    - AI analysis will be performed by Gemini API via Edge Function
    - Default analysis_status is 'pending'
*/

DO $$
BEGIN
  -- Add video_url column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_reflections' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE match_reflections ADD COLUMN video_url text;
  END IF;

  -- Add ai_analysis column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_reflections' AND column_name = 'ai_analysis'
  ) THEN
    ALTER TABLE match_reflections ADD COLUMN ai_analysis text;
  END IF;

  -- Add analysis_status column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_reflections' AND column_name = 'analysis_status'
  ) THEN
    ALTER TABLE match_reflections ADD COLUMN analysis_status text DEFAULT 'pending';
  END IF;
END $$;