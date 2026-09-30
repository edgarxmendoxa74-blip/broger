/*
  # Add Hero Image Setting

  Adds the hero_image setting to site_settings table
*/

-- Insert hero_image setting
INSERT INTO site_settings (id, value, type, description) VALUES
  ('hero_image', 'https://amyfewmjpfplarkrevut.supabase.co/storage/v1/object/public/menu-images/1761372138519-5ciub5jsntb.jpg', 'image', 'The hero/banner image URL displayed on the homepage')
ON CONFLICT (id) DO NOTHING;
