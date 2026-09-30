/*
  # Add Cash on Delivery Payment Method (Re-add)

  Re-adds the cash on delivery payment method with "For Repeated Customers Only" note
*/

-- Insert cash on delivery payment method
INSERT INTO payment_methods (id, name, account_number, account_name, qr_code_url, sort_order, active) VALUES
  ('cash-on-delivery', 'Cash on Delivery (COD)', 'N/A', 'N/A', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 4, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;
