/*
  # Add Analysis Status Column

  1. Changes
    - Add `analysis_status` column to track AI video analysis progress
    - Possible values: 'pending', 'processing', 'completed', 'failed', null
    
  2. Notes
    - Null means no video or no analysis requested
    - This helps users understand the analysis state
*/

DO $$
BEGIN
  -- Add analysis_status column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'match_reflections' AND column_name = 'analysis_status'
  ) THEN
    ALTER TABLE match_reflections 
    ADD COLUMN analysis_status text CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed'));
  END IF;
END $$;