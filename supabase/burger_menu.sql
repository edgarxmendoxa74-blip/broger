-- ============================================================================
-- BRO-GER — REPLACE MENU WITH BURGER PRODUCTS
-- ============================================================================
-- Paste into the Supabase SQL Editor and click "Run".
--
-- WARNING: this DELETES every current menu item (with their sizes/add-ons)
-- and the old categories (Dim Sum, Noodles, Coffee, ...), then adds the
-- burger menu below. Prices and descriptions are starting values — edit them
-- anytime in Admin → Manage Menu Items. Photos can be uploaded there too.
-- ============================================================================

BEGIN;

-- 1. Remove the old menu (variations + add-ons are deleted automatically)
DELETE FROM menu_items;
DELETE FROM categories;

-- 2. Burger shop categories
INSERT INTO categories (id, name, icon, sort_order, active) VALUES
  ('grilled-burger',   'Grilled Burgers',   '🍔', 1, true),
  ('chicken-sandwich', 'Chicken Sandwiches', '🐔', 2, true),
  ('picka-picka',      'Picka-Picka',        '🍟', 3, true),
  ('drinks',           'Drinks',             '🥤', 4, true),
  ('add-ons',          'Add Ons',            '➕', 5, true);

-- 3. Menu items
INSERT INTO menu_items (name, description, base_price, category, popular, available, sort_order) VALUES
  -- Grilled Burgers
  ('Classic Bro-Ger',        'Char-grilled beef patty, melted cheese, lettuce, tomato, onions and our signature Bro sauce.', 129, 'grilled-burger', true,  true, 1),
  ('Cheesy Bro-Ger',         'Grilled beef patty smothered in double cheese with pickles and Bro sauce.',                    149, 'grilled-burger', true,  true, 2),
  ('Bacon Bro-Ger',          'Grilled beef patty, crispy bacon, cheese, lettuce and smoky BBQ mayo.',                        169, 'grilled-burger', true,  true, 3),
  ('Double Bro-Ger',         'Two grilled beef patties, double cheese, onions and Bro sauce. For the really hungry.',        199, 'grilled-burger', false, true, 4),
  ('Mushroom Melt Bro-Ger',  'Grilled beef patty topped with creamy mushroom sauce and melted cheese.',                      169, 'grilled-burger', false, true, 5),
  ('BBQ Onion Ring Bro-Ger', 'Grilled beef patty, crispy onion rings, cheese and sweet-smoky BBQ sauce.',                    179, 'grilled-burger', false, true, 6),

  -- Chicken Sandwiches
  ('Crispy Chicken Sandwich', 'Crunchy fried chicken fillet, lettuce, pickles and garlic mayo on a toasted bun.',            139, 'chicken-sandwich', true,  true, 1),
  ('Spicy Chicken Sandwich',  'Crispy chicken fillet tossed in hot sauce with coleslaw and spicy mayo.',                     149, 'chicken-sandwich', false, true, 2),
  ('Chicken Cheese Melt',     'Crispy chicken fillet topped with melted cheese sauce and caramelized onions.',              159, 'chicken-sandwich', false, true, 3),

  -- Picka-Picka (sides & snacks)
  ('Classic Fries',          'Golden, crispy fries with your choice of seasoning.',                                           79, 'picka-picka', false, true, 1),
  ('Cheesy Fries',           'Crispy fries drowned in warm cheese sauce.',                                                    99, 'picka-picka', true,  true, 2),
  ('Onion Rings',            'Thick-cut battered onion rings with dipping sauce.',                                            99, 'picka-picka', false, true, 3),
  ('Chicken Poppers',        'Bite-sized crispy chicken with honey mustard dip.',                                            129, 'picka-picka', false, true, 4),
  ('Picka-Picka Platter',    'Good for sharing: fries, onion rings, chicken poppers and nuggets with 3 dips.',                299, 'picka-picka', true,  true, 5),

  -- Drinks
  ('House Iced Tea',         'Freshly brewed, sweetened iced tea.',                                                           45, 'drinks', false, true, 1),
  ('Soft Drinks',            'Ice-cold soda in a can.',                                                                       50, 'drinks', false, true, 2),
  ('Cucumber Lemonade',      'Refreshing lemonade with fresh cucumber.',                                                      65, 'drinks', false, true, 3),
  ('Chocolate Milkshake',    'Thick, creamy chocolate shake topped with whipped cream.',                                      99, 'drinks', true,  true, 4),

  -- Add Ons (sold on their own)
  ('Extra Beef Patty',       'An extra char-grilled beef patty.',                                                             60, 'add-ons', false, true, 1),
  ('Extra Cheese',           'A slice of melted cheese.',                                                                     20, 'add-ons', false, true, 2),
  ('Bacon Strips',           'Two strips of crispy bacon.',                                                                   35, 'add-ons', false, true, 3),
  ('Fried Egg',              'Sunny-side-up egg.',                                                                            20, 'add-ons', false, true, 4),
  ('Extra Bro Sauce',        'Our signature house sauce.',                                                                    15, 'add-ons', false, true, 5);

-- 4. Sizes / flavors (price is added on top of the base price)
INSERT INTO variations (menu_item_id, name, price)
SELECT m.id, v.name, v.price
FROM (VALUES
  ('Classic Fries',   'Regular', 0), ('Classic Fries',   'Large', 30),
  ('Cheesy Fries',    'Regular', 0), ('Cheesy Fries',    'Large', 30),
  ('Chicken Poppers', '6 pcs',   0), ('Chicken Poppers', '12 pcs', 110),
  ('House Iced Tea',  'Regular', 0), ('House Iced Tea',  'Large', 15),
  ('Soft Drinks',     'Coke',    0), ('Soft Drinks',     'Sprite', 0), ('Soft Drinks', 'Royal', 0),
  ('Cucumber Lemonade', 'Regular', 0), ('Cucumber Lemonade', 'Large', 20)
) AS v(item_name, name, price)
JOIN menu_items m ON m.name = v.item_name;

-- 5. Add-ons customers can put on burgers and chicken sandwiches
INSERT INTO add_ons (menu_item_id, name, price, category)
SELECT m.id, a.name, a.price, a.category
FROM menu_items m
CROSS JOIN (VALUES
  ('Extra Beef Patty', 60, 'protein'),
  ('Bacon',            35, 'protein'),
  ('Extra Cheese',     20, 'extras'),
  ('Fried Egg',        20, 'extras'),
  ('Extra Bro Sauce',  15, 'sauce')
) AS a(name, price, category)
WHERE m.category IN ('grilled-burger', 'chicken-sandwich');

INSERT INTO add_ons (menu_item_id, name, price, category)
SELECT m.id, 'Extra Spicy', 0, 'spice'
FROM menu_items m
WHERE m.name = 'Spicy Chicken Sandwich';

-- 6. Branding in Site Settings
UPDATE site_settings SET value = 'Bro-Ger' WHERE id = 'site_name';
UPDATE site_settings SET value = 'Not your ordinary burger. Est. 2022.' WHERE id = 'site_description';
UPDATE site_settings SET value = '/logo.jpg' WHERE id = 'site_logo';

COMMIT;

-- Done! ✅
