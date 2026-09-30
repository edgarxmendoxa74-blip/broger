/*
  # Add Images to Reviews

  1. Changes
    - Add `images` column to `reviews` table (text array to store image URLs)
    - Update existing reviews to have empty array by default

  2. Purpose
    - Allow customers to attach multiple images to their reviews
    - Store image URLs from Supabase storage
*/

-- Add images column to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- Update existing reviews to have empty array for images
UPDATE reviews 
SET images = '{}' 
WHERE images IS NULL;
