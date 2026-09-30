/*
  # Add Cash on Delivery Payment Method

  Adds the cash on delivery payment method
*/

-- Insert cash on delivery payment method
INSERT INTO payment_methods (id, name, account_number, account_name, qr_code_url, sort_order, active) VALUES
  ('cash-on-delivery', 'Cash on Delivery (COD)', 'N/A', 'N/A', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 4, true)
ON CONFLICT (id) DO NOTHING;
