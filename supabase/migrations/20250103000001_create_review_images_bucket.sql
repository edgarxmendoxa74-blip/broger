/*
  # Create storage bucket for review images

  1. Storage Setup
    - Create 'review-images' bucket for storing review photos
    - Set bucket to be publicly accessible for reading
    - Allow public upload access (for customer reviews)

  2. Security
    - Public read access for review images
    - Public upload access for review images (anyone can submit)
    - Public delete access (for removing uploaded images)
    - File size and type restrictions via policies
*/

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-images',
  'review-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access to review images
CREATE POLICY "Public read access for review images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'review-images');

-- Allow public upload access for review images
CREATE POLICY "Anyone can upload review images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'review-images');

-- Allow public delete access for review images (for removing uploaded images)
CREATE POLICY "Anyone can delete review images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'review-images');
