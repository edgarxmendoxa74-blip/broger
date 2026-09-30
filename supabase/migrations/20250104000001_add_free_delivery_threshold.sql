/*
  # Add Free Delivery Threshold Setting
  
  Adds a configurable threshold for free delivery eligibility.
*/

-- Insert free delivery threshold setting
INSERT INTO site_settings (id, value, type, description) VALUES
  ('free_delivery_threshold', '350', 'number', 'Order value threshold for free in-house delivery (in pesos)')
ON CONFLICT (id) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;

