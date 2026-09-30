/*
  # Add Sort Order to Menu Items
  
  Adds a sort_order field to menu_items table to allow custom arrangement of products.
*/

-- Add sort_order column to menu_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN sort_order integer DEFAULT 0;
    
    -- Set initial sort_order based on created_at for existing items
    UPDATE menu_items
    SET sort_order = (
      SELECT row_number() OVER (ORDER BY created_at)
      FROM (SELECT 1) AS dummy
    ) - 1;
  END IF;
END $$;

-- Create index for better performance when ordering
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(category, sort_order, created_at);

