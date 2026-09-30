-- ============================================================================
-- BRO-GER / BERACAH CAFE — FULL DATABASE SETUP
-- ============================================================================
-- Paste this whole file into the Supabase SQL Editor and click "Run".
--
-- Consolidated from supabase/migrations, fixed so it runs in one go:
--   - Tables are created before anything that depends on them.
--   - Safe to re-run (IF NOT EXISTS / DROP ... IF EXISTS / no duplicate rows).
--   - Skipped broken/duplicate migrations:
--       * frosty_wildflower (used text IDs in a uuid column -> always errors)
--       * raspy_heart (exact duplicate of steep_cake, and ran before the
--         'dim-sum' category existed -> foreign key error)
--
-- IMPORTANT — ADMIN ACCESS:
--   The admin dashboard logs in with a password checked in the browser, NOT
--   Supabase Auth, so every request uses the public "anon" key. The original
--   policies only allowed writes for "authenticated" users, which would make
--   every admin save fail. The policies below therefore allow the anon role
--   to read AND write. This means anyone who has your anon key (it is visible
--   in the website's JS) can edit the menu. Switch to Supabase Auth later to
--   lock this down.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Helper: auto-update updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '☕',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  category text NOT NULL,
  popular boolean DEFAULT false,
  available boolean DEFAULT true,
  image_url text,
  discount_price decimal(10,2),
  discount_start_date timestamptz,
  discount_end_date timestamptz,
  discount_active boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- In case menu_items already existed from an older setup, add missing columns
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS available boolean DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_price decimal(10,2);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_start_date timestamptz;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_end_date timestamptz;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_active boolean DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

CREATE TABLE IF NOT EXISTS variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id text PRIMARY KEY,
  name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  qr_code_url text NOT NULL,
  active boolean DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  description text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  images text[] DEFAULT '{}',
  approved boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS service_options (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '🚶',
  description text,
  active boolean DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_menu_items_discount_active ON menu_items(discount_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_discount_dates ON menu_items(discount_start_date, discount_end_date);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(category, sort_order, created_at);

-- ---------------------------------------------------------------------------
-- 4. updated_at triggers
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_options_updated_at ON service_options;
CREATE TRIGGER update_service_options_updated_at BEFORE UPDATE ON service_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 5. Discount pricing helper functions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_discount_active(
  discount_active boolean,
  discount_start_date timestamptz,
  discount_end_date timestamptz
)
RETURNS boolean AS $$
BEGIN
  IF NOT discount_active THEN
    RETURN false;
  END IF;
  IF discount_start_date IS NULL AND discount_end_date IS NULL THEN
    RETURN discount_active;
  END IF;
  RETURN (
    (discount_start_date IS NULL OR now() >= discount_start_date) AND
    (discount_end_date IS NULL OR now() <= discount_end_date)
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_effective_price(
  base_price decimal,
  discount_price decimal,
  discount_active boolean,
  discount_start_date timestamptz,
  discount_end_date timestamptz
)
RETURNS decimal AS $$
BEGIN
  IF is_discount_active(discount_active, discount_start_date, discount_end_date) AND discount_price IS NOT NULL THEN
    RETURN discount_price;
  END IF;
  RETURN base_price;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 6. Row Level Security (see ADMIN ACCESS note at top)
-- ---------------------------------------------------------------------------
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE variations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_options ENABLE ROW LEVEL SECURITY;

-- Remove the original migration policies (if present) so the new ones apply cleanly
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Anyone can read menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can read variations" ON variations;
DROP POLICY IF EXISTS "Authenticated users can manage variations" ON variations;
DROP POLICY IF EXISTS "Anyone can read add-ons" ON add_ons;
DROP POLICY IF EXISTS "Authenticated users can manage add-ons" ON add_ons;
DROP POLICY IF EXISTS "Anyone can read active payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Authenticated users can manage payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can read approved reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can manage reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can read active service options" ON service_options;
DROP POLICY IF EXISTS "Authenticated users can manage service options" ON service_options;

-- The app filters active/approved rows itself; the admin needs to see and edit all rows.
DROP POLICY IF EXISTS "Public full access" ON categories;
CREATE POLICY "Public full access" ON categories      FOR ALL TO public USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public full access" ON menu_items;
CREATE POLICY "Public full access" ON menu_items      FOR ALL TO public USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public full access" ON variations;
CREATE POLICY "Public full access" ON variations      FOR ALL TO public USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public full access" ON add_ons;
CREATE POLICY "Public full access" ON add_ons         FOR ALL TO public USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public full access" ON payment_methods;
CREATE POLICY "Public full access" ON payment_methods FOR ALL TO public USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public full access" ON site_settings;
CREATE POLICY "Public full access" ON site_settings   FOR ALL TO public USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public full access" ON reviews;
CREATE POLICY "Public full access" ON reviews         FOR ALL TO public USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public full access" ON service_options;
CREATE POLICY "Public full access" ON service_options FOR ALL TO public USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 7. Storage buckets (menu images + review images, 5MB, images only)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('menu-images',   'menu-images',   true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('review-images', 'review-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete menu images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for review images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload review images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete review images" ON storage.objects;
DROP POLICY IF EXISTS "Public access for menu and review images" ON storage.objects;

CREATE POLICY "Public access for menu and review images" ON storage.objects
  FOR ALL TO public
  USING (bucket_id IN ('menu-images', 'review-images'))
  WITH CHECK (bucket_id IN ('menu-images', 'review-images'));

-- ---------------------------------------------------------------------------
-- 8. DATA: categories
-- ---------------------------------------------------------------------------
INSERT INTO categories (id, name, icon, sort_order, active) VALUES
  ('dim-sum',     'Dim Sum',         '🥟', 1, true),
  ('noodles',     'Noodles',         '🍜', 2, true),
  ('rice-dishes', 'Rice Dishes',     '🍚', 3, true),
  ('beverages',   'Beverages',       '🍵', 4, true),
  ('hot-coffee',  'Hot Coffee',      '☕', 5, true),
  ('iced-coffee', 'Iced Coffee',     '🧊', 6, true),
  ('non-coffee',  'Non-Coffee',      '🫖', 7, true),
  ('food',        'Food & Pastries', '🥐', 8, true)
ON CONFLICT (id) DO NOTHING;

-- menu_items.category must be a valid category
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'menu_items_category_fkey'
  ) THEN
    ALTER TABLE menu_items
      ADD CONSTRAINT menu_items_category_fkey FOREIGN KEY (category) REFERENCES categories(id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 9. DATA: menu items + prices (skips any item whose name already exists)
-- ---------------------------------------------------------------------------
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url, sort_order)
SELECT v.name, v.description, v.base_price, v.category, v.popular, true, v.image_url, v.sort_order
FROM (VALUES
  -- Platters
  ('Extra Small Platter', 'Perfect for small gatherings (3-5 pax) - 50 pieces total: 10 Pork Xiao Long Bao, 10 Molten Chocolate Xiao Long Bao, 10 Pan Fried Pork Dumpling, 10 Prawn Dumpling, 10 Pork & Shrimp Siomai', 998, 'dim-sum', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Small Platter', 'Great for family meals (5-8 pax) - 60 pieces total: 10 Pork Xiao Long Bao, 14 Molten Chocolate Xiao Long Bao, 10 Pan Fried Pork Dumpling, 12 Prawn Dumpling, 14 Pork & Shrimp Siomai', 1100, 'dim-sum', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Medium Platter', 'Perfect for parties (10-12 pax) - 80 pieces total: 14 Pork Xiao Long Bao, 16 Molten Chocolate Xiao Long Bao, 18 Pan Fried Pork Dumpling, 14 Prawn Dumpling, 18 Pork & Shrimp Siomai', 1500, 'dim-sum', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 3),
  ('Large Platter', 'Ultimate feast for large groups (15-18 pax) - 100 pieces total: 20 Pork Xiao Long Bao, 20 Molten Chocolate Xiao Long Bao, 20 Pan Fried Pork Dumpling, 20 Prawn Dumpling, 20 Pork & Shrimp Siomai', 1900, 'dim-sum', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 4),
  -- NomBox sets
  ('NomBox Feast', 'The ultimate dim sum experience - 24 pieces total: 3 Mongopao, 3 Brown Sugar Mantho, 3 Taro Balls, 3 Pork Xiao Long Bao, 3 Pork & Veggie, 3 Pork & Shrimp Siomai, 3 Hakaw, 3 Prawn Dumplings', 528, 'dim-sum', true, 'https://images.pexels.com/photos/5409751/pexels-photo-5409751.jpeg?auto=compress&cs=tinysrgb&w=800', 5),
  ('NomBox Mid', 'Perfect variety pack - 17 pieces total: 3 Mongopao, 2 Brown Sugar Mantho, 2 Taro Balls, 2 Pork Xiao Long Bao, 2 Pork & Veggie, 2 Pork Shrimp Siomai, 2 Hakaw, 2 Pork & Mushroom', 368, 'dim-sum', true, 'https://images.pexels.com/photos/5409751/pexels-photo-5409751.jpeg?auto=compress&cs=tinysrgb&w=800', 6),
  ('NomBox Mini', 'Great starter pack - 12 pieces total: 2 Mongopao, 2 Brown Sugar Mantho, 2 Pork Xiao Long Bao, 2 Pork & Veggie, 2 Pork Shrimp Siomai, 2 Hakaw', 238, 'dim-sum', false, 'https://images.pexels.com/photos/5409751/pexels-photo-5409751.jpeg?auto=compress&cs=tinysrgb&w=800', 7),
  -- Special platters
  ('Holiday Platter', 'Special festive assortment perfect for celebrations - 80 pieces of our finest dim sum selection', 1650, 'dim-sum', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 8),
  ('Trio Platter', 'Three classic favorites - 60 pieces total: 20 Siomai, 20 Hakaw, 20 Prawn Dumplings', 1200, 'dim-sum', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 9),
  ('Siomai Platter', 'For siomai lovers - 55 pieces of our signature pork and shrimp siomai', 998, 'dim-sum', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 10),
  ('Prawn Platter', 'Fresh prawn dumplings - 60 pieces of succulent prawn dumplings', 1200, 'dim-sum', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 11),
  ('Hakaw XS Platter', 'Delicate shrimp dumplings - 50 pieces of traditional hakaw', 1100, 'dim-sum', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 12),
  ('Hakaw Small Platter', 'More hakaw goodness - 60 pieces of our signature shrimp dumplings', 1300, 'dim-sum', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 13),
  -- Individual dim sum
  ('Pork Xiao Long Bao', 'Traditional soup dumplings filled with savory pork and rich broth', 180, 'dim-sum', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 14),
  ('Molten Chocolate Xiao Long Bao', 'Innovative dessert dumpling with warm molten chocolate center', 220, 'dim-sum', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 15),
  ('Pan Fried Pork Dumpling', 'Crispy bottom dumplings filled with seasoned pork', 160, 'dim-sum', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 16),
  ('Prawn Dumpling (Hakaw)', 'Translucent dumplings filled with fresh prawns and bamboo shoots', 180, 'dim-sum', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 17),
  ('Pork & Shrimp Siomai', 'Open-topped dumplings with pork, shrimp, and mushrooms', 160, 'dim-sum', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 18),
  ('Mongopao', 'Fluffy steamed buns with sweet mango filling', 140, 'dim-sum', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 19),
  ('Brown Sugar Mantho', 'Sweet steamed buns with rich brown sugar flavor', 120, 'dim-sum', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 20),
  ('Taro Balls', 'Chewy taro-flavored balls, a popular Taiwanese treat', 100, 'dim-sum', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 21),
  ('Pork & Veggie Dumpling', 'Healthy dumplings filled with pork and fresh vegetables', 150, 'dim-sum', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 22),
  ('Pork & Mushroom Dumpling', 'Savory dumplings with pork and shiitake mushrooms', 160, 'dim-sum', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 23),
  -- Noodles
  ('Beef Chow Fun', 'Stir-fried wide rice noodles with tender beef and bean sprouts', 280, 'noodles', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Dan Dan Noodles', 'Sichuan noodles with spicy sesame sauce and minced pork', 250, 'noodles', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Wonton Noodle Soup', 'Fresh egg noodles in clear broth with pork and shrimp wontons', 220, 'noodles', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 3),
  ('Pad Thai', 'Thai stir-fried rice noodles with shrimp, tofu, and peanuts', 260, 'noodles', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 4),
  ('Chicken Lo Mein', 'Soft egg noodles tossed with chicken and vegetables', 240, 'noodles', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 5),
  -- Rice dishes
  ('Yang Chow Fried Rice', 'Classic fried rice with shrimp, char siu, and eggs', 280, 'rice-dishes', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Beef and Broccoli Rice', 'Tender beef with fresh broccoli in savory sauce over steamed rice', 320, 'rice-dishes', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Sweet and Sour Pork Rice', 'Crispy pork with pineapple and bell peppers in tangy sauce', 300, 'rice-dishes', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 3),
  ('Mapo Tofu Rice', 'Silky tofu in spicy Sichuan sauce with ground pork over rice', 260, 'rice-dishes', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 4),
  ('Kung Pao Chicken Rice', 'Diced chicken with peanuts and chili peppers in savory sauce', 290, 'rice-dishes', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 5),
  -- Beverages
  ('Jasmine Tea', 'Fragrant jasmine tea served hot in traditional pot', 80, 'beverages', true, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
  ('Oolong Tea', 'Premium oolong tea with complex floral notes', 100, 'beverages', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
  ('Chrysanthemum Tea', 'Cooling herbal tea with dried chrysanthemum flowers', 90, 'beverages', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 3),
  ('Fresh Lychee Juice', 'Sweet and refreshing lychee juice served chilled', 120, 'beverages', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 4),
  ('Winter Melon Tea', 'Traditional Chinese tea with subtle sweet flavor', 85, 'beverages', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 5),
  ('Hot Soy Milk', 'Fresh soy milk served hot with optional sugar', 70, 'beverages', false, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=800', 6)
) AS v(name, description, base_price, category, popular, image_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM menu_items m WHERE m.name = v.name);

-- Variations (size/flavor options with extra price)
INSERT INTO variations (menu_item_id, name, price)
SELECT m.id, v.name, v.price
FROM (VALUES
  ('Hot Soy Milk', 'Plain', 0),
  ('Hot Soy Milk', 'Sweetened', 10)
) AS v(item_name, name, price)
JOIN menu_items m ON m.name = v.item_name
WHERE NOT EXISTS (
  SELECT 1 FROM variations x WHERE x.menu_item_id = m.id AND x.name = v.name
);

-- ---------------------------------------------------------------------------
-- 10. DATA: payment methods (edit account numbers/QR codes in the admin)
-- ---------------------------------------------------------------------------
INSERT INTO payment_methods (id, name, account_number, account_name, qr_code_url, sort_order, active) VALUES
  ('gcash',            'GCash',                  '09XX XXX XXXX',           'M&C Bakehouse', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 1, true),
  ('maya',             'Maya (PayMaya)',         '09XX XXX XXXX',           'M&C Bakehouse', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 2, true),
  ('bank-transfer',    'Bank Transfer',          'Account: 1234-5678-9012', 'M&C Bakehouse', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 3, true),
  ('cash-on-delivery', 'Cash on Delivery (COD)', 'N/A',                     'N/A',           'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 4, true)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 11. DATA: service options
-- ---------------------------------------------------------------------------
INSERT INTO service_options (id, name, icon, description, sort_order, active) VALUES
  ('pickup',   'Pickup',   '🚶', 'Pick up your order at our location', 1, true),
  ('delivery', 'Delivery', '🛵', 'We will deliver to your location',   2, true)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 12. DATA: site settings (name, logo, hero, currency, delivery, sidebar)
-- ---------------------------------------------------------------------------
INSERT INTO site_settings (id, value, type, description) VALUES
  ('site_name',               'Beracah Cafe', 'text',  'The name of the cafe/restaurant'),
  ('site_logo',               'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 'image', 'The logo image URL for the site'),
  ('site_description',        'Welcome to Beracah Cafe - Your perfect coffee destination', 'text', 'Short description of the cafe'),
  ('currency',                'PHP',          'text',  'Currency symbol for prices'),
  ('currency_code',           'PHP',          'text',  'Currency code for payments'),
  ('hero_image',              'https://amyfewmjpfplarkrevut.supabase.co/storage/v1/object/public/menu-images/1761372138519-5ciub5jsntb.jpg', 'image', 'The hero/banner image URL displayed on the homepage'),
  ('free_delivery_threshold', '350',          'number','Order value threshold for free in-house delivery (in pesos)'),
  ('sidebar_about_us',        'You can also Contact us on our page for faster transaction @Bro-Ger FB page', 'text', 'About Us section content'),
  ('sidebar_contact_phone',   '+639171102916', 'text', 'Contact phone number'),
  ('sidebar_contact_email',   'brogerphilippines@gmail.com', 'text', 'Contact email address'),
  ('sidebar_contact_message', '+63',          'text',  'Contact message/WhatsApp number'),
  ('sidebar_delivery_info',   'Within bagong barrio', 'text', 'Delivery information'),
  ('sidebar_pickup_info',     'Pickup time: WE WILL CONTACT YOU ONCE YOUR ORDER IS DONE', 'text', 'Pickup information')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 13. DATA: sample reviews (only inserted if the reviews table is empty)
-- ---------------------------------------------------------------------------
INSERT INTO reviews (customer_name, customer_email, rating, title, content, approved, featured)
SELECT * FROM (VALUES
  ('Maria Santos',   'maria@example.com',  5, 'Amazing Food!',       'The grilled burger was absolutely delicious! Perfectly cooked and the flavors were amazing. Will definitely come back!', true, true),
  ('John Dela Cruz', 'john@example.com',   4, 'Great Service',       'Fast delivery and the food was still hot when it arrived. The chicken sandwich was really good.', true, true),
  ('Ana Rodriguez',  'ana@example.com',    5, 'Best Coffee Shop!',   'Love the atmosphere and the coffee is excellent. The staff is very friendly and accommodating.', true, false),
  ('Carlos Mendoza', 'carlos@example.com', 3, 'Good Food',           'The food was good but the delivery took longer than expected. Still satisfied with the quality.', true, false),
  ('Lisa Garcia',    'lisa@example.com',   5, 'Highly Recommended!', 'Everything was perfect! From ordering to delivery, the whole experience was smooth. The picka-picka was especially good.', true, true)
) AS v(customer_name, customer_email, rating, title, content, approved, featured)
WHERE NOT EXISTS (SELECT 1 FROM reviews);

-- Done! ✅
