/*
  # Create Service Options Management System

  1. New Tables
    - `service_options`
      - `id` (text, primary key) - service identifier (pickup, delivery, dine-in)
      - `name` (text) - display name
      - `icon` (text) - emoji icon
      - `description` (text, optional) - additional information
      - `active` (boolean) - whether service is active
      - `sort_order` (integer) - display order
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on service_options table
    - Add policies for public read access
    - Add policies for authenticated admin access

  3. Initial Data
    - Insert default service options (Pickup and Delivery)
*/

-- Create service_options table
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

-- Enable RLS
ALTER TABLE service_options ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can read active service options"
  ON service_options
  FOR SELECT
  TO public
  USING (active = true);

-- Create policies for authenticated admin access
CREATE POLICY "Authenticated users can manage service options"
  ON service_options
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger for service_options
CREATE TRIGGER update_service_options_updated_at
  BEFORE UPDATE ON service_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default service options
INSERT INTO service_options (id, name, icon, description, sort_order, active) VALUES
  ('pickup', 'Pickup', '🚶', 'Pick up your order at our location', 1, true),
  ('delivery', 'Delivery', '🛵', 'We will deliver to your location', 2, true)
ON CONFLICT (id) DO NOTHING;
