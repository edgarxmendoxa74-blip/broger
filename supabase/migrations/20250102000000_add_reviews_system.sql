/*
  # Add Reviews Management System

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `customer_name` (text) - name of the reviewer
      - `customer_email` (text, optional) - email of the reviewer
      - `rating` (integer) - rating from 1 to 5 stars
      - `title` (text) - review title
      - `content` (text) - review content
      - `approved` (boolean) - whether review is approved for display
      - `featured` (boolean) - whether review is featured
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on reviews table
    - Add policies for public read access (approved reviews only)
    - Add policies for authenticated admin access
    - Add policies for public insert (new reviews)

  3. Features
    - Review approval system
    - Featured reviews
    - Star rating system
    - Customer information tracking
*/

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  approved boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (approved reviews only)
CREATE POLICY "Anyone can read approved reviews"
  ON reviews
  FOR SELECT
  TO public
  USING (approved = true);

-- Create policies for public insert (new reviews)
CREATE POLICY "Anyone can insert reviews"
  ON reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for authenticated admin access
CREATE POLICY "Authenticated users can manage reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger for reviews
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample reviews
INSERT INTO reviews (customer_name, customer_email, rating, title, content, approved, featured) VALUES
  ('Maria Santos', 'maria@example.com', 5, 'Amazing Food!', 'The grilled burger was absolutely delicious! Perfectly cooked and the flavors were amazing. Will definitely come back!', true, true),
  ('John Dela Cruz', 'john@example.com', 4, 'Great Service', 'Fast delivery and the food was still hot when it arrived. The chicken sandwich was really good.', true, true),
  ('Ana Rodriguez', 'ana@example.com', 5, 'Best Coffee Shop!', 'Love the atmosphere and the coffee is excellent. The staff is very friendly and accommodating.', true, false),
  ('Carlos Mendoza', 'carlos@example.com', 3, 'Good Food', 'The food was good but the delivery took longer than expected. Still satisfied with the quality.', true, false),
  ('Lisa Garcia', 'lisa@example.com', 5, 'Highly Recommended!', 'Everything was perfect! From ordering to delivery, the whole experience was smooth. The picka-picka was especially good.', true, true)
ON CONFLICT (id) DO NOTHING;
