/*
  # Add Team Members Details

  1. Changes
    - Add columns to `team_members` table:
      - `name` (text) - Member's name
      - `position` (text) - Playing position
      - `characteristics` (text) - Player characteristics and notes
      - `jersey_number` (integer) - Jersey/uniform number
    
  2. Security
    - Existing RLS policies already cover these new columns
    - No additional security changes needed
*/

DO $$
BEGIN
  -- Add name column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'name'
  ) THEN
    ALTER TABLE team_members ADD COLUMN name text DEFAULT '';
  END IF;

  -- Add position column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'position'
  ) THEN
    ALTER TABLE team_members ADD COLUMN position text DEFAULT '';
  END IF;

  -- Add characteristics column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'characteristics'
  ) THEN
    ALTER TABLE team_members ADD COLUMN characteristics text DEFAULT '';
  END IF;

  -- Add jersey_number column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'jersey_number'
  ) THEN
    ALTER TABLE team_members ADD COLUMN jersey_number integer;
  END IF;
END $$;