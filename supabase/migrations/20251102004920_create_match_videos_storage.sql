/*
  # Create Match Videos Storage Bucket

  1. Storage Setup
    - Create 'match-videos' bucket for storing match video files
    - Set bucket as private (not publicly accessible)
    
  2. Security Policies
    - Users can upload videos to their own folder (user_id/)
    - Users can view their own videos
    - Users can delete their own videos
    - All policies check folder ownership using auth.uid()
*/

-- Create storage bucket for match videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('match-videos', 'match-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
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