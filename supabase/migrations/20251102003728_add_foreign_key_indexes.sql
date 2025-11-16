/*
  # Add Foreign Key Indexes

  1. Performance Optimization
    - Add indexes on all foreign key columns to improve query performance
    - Indexes created:
      - `goals.user_id`
      - `match_reflections.user_id`
      - `team_members.user_id`
      - `teams.created_by`
      - `training_records.user_id`
    
  2. Notes
    - These indexes will significantly improve JOIN performance
    - Queries filtering by user_id will be much faster
    - Uses IF NOT EXISTS to prevent errors on re-run
*/

-- Add index on goals.user_id
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Add index on match_reflections.user_id
CREATE INDEX IF NOT EXISTS idx_match_reflections_user_id ON match_reflections(user_id);

-- Add index on team_members.user_id
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Add index on teams.created_by
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);

-- Add index on training_records.user_id
CREATE INDEX IF NOT EXISTS idx_training_records_user_id ON training_records(user_id);