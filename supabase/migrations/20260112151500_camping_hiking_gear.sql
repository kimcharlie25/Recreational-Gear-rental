-- Migration: Add Camping & Hiking Equipment
-- Created: 2026-01-12

-- 1. Insert Categories
INSERT INTO categories (id, name, icon, sort_order, active) VALUES
  ('tents', 'Tents', '⛺', 1, true),
  ('hiking-bags', 'Hiking Bags', '🎒', 2, true),
  ('sleeping-bags', 'Sleeping Bags', '🛌', 3, true),
  ('camping-tarps', 'Camping Tarps', '⛺', 4, true),
  ('lighting', 'Lighting', '🔦', 5, true),
  ('furniture', 'Trekking & Camp Furniture', '🪑', 6, true),
  ('cooking', 'Cooking Equipment', '🍳', 7, true),
  ('sleeping-mats', 'Sleeping Mats', '🧘', 8, true),
  ('electronics', 'Electronics', '🔌', 9, true),
  ('footwear', 'Footwear', '🥾', 10, true),
  ('power', 'Power Equipment', '🔋', 11, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- 2. Insert Menu Items and store their IDs
-- We'll use a temporary table or variables to handle item associations with variations

DO $$
DECLARE
    item_id uuid;
BEGIN
    -- === TENTS ===
    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('1 Person & 2 Person Tent', 'Compact and easy to set up for individuals or couples.', 0, 'tents', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 350), (item_id, '3 Days', 500);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('3 Person & 4 Person Tent', 'Spacious tent for small groups or families.', 0, 'tents', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 450), (item_id, '3 Days', 600);


    -- === HIKING BAGS ===
    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('24L / 34L / 38L / 45+10L Hiking Bags', 'Lightweight and durable backpack suitable for day hikes and short trips.', 0, 'hiking-bags', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 350), (item_id, '3 Days', 500);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('70L & Porter Bags', 'Large capacity bags for multi-day expeditions.', 0, 'hiking-bags', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 450), (item_id, '3 Days', 600);


    -- === SLEEPING BAGS ===
    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Sleeping Bag', 'Keep warm and comfortable during your outdoor stay.', 0, 'sleeping-bags', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 150), (item_id, '3 Days', 200);


    -- === CAMPING TARPS ===
    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Camping Tarp', 'Versatile shelter for sun or rain protection.', 0, 'camping-tarps', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 200), (item_id, '3 Days', 250);
    INSERT INTO add_ons (menu_item_id, name, price, category) VALUES
      (item_id, 'With poles', 50, 'Setup');


    -- === LIGHTING ===
    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Headlamp A', 'Efficient hands-free lighting for trail walking.', 0, 'lighting', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 100), (item_id, '3 Days', 150);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Headlamp B (Nitecore)', 'Professional grade headlamp with superior brightness.', 0, 'lighting', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 200), (item_id, '3 Days', 250);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('String Light / Camping Light', 'Ambiance and utility lighting for your campsite.', 0, 'lighting', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 50), (item_id, '3 Days', 70);


    -- === TREKKING & CAMP FURNITURE ===
    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Trekking Pole', 'Stability and support for challenging terrains.', 0, 'furniture', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 100), (item_id, '3 Days', 150);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Camping Chair', 'Classic Camp Chair or Scoop Chair for comfortable lounging.', 0, 'furniture', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 100), (item_id, '3 Days', 150);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Camping Table (Medium)', 'Portable table for dining or organization.', 0, 'furniture', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 100), (item_id, '3 Days', 150);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Camping Table (X-Large)', 'Large portable table for group activities.', 0, 'furniture', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 150), (item_id, '3 Days', 200);


    -- === COOKING EQUIPMENT ===
    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Camping Burner', 'Reliable cooking source for outdoor meals.', 0, 'cooking', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 100), (item_id, '3 Days', 150);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Burner A', 'Standard portable burner.', 0, 'cooking', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 100), (item_id, '3 Days', 150);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Burner B', 'Compact portable burner.', 0, 'cooking', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 50), (item_id, '3 Days', 70);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Cookset (1–3 Persons)', 'Essential cooking utensils for small groups.', 0, 'cooking', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 100), (item_id, '3 Days', 150);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Cookset (5–7 Persons)', 'Essential cooking utensils for medium groups.', 0, 'cooking', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 150), (item_id, '3 Days', 200);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Cookset (8–10 Persons)', 'Essential cooking utensils for large groups.', 0, 'cooking', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 200), (item_id, '3 Days', 250);


    -- === SLEEPING MATS ===
    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Sleeping Mat (Eggnest Mat)', 'Comfortable folding foam mat for ground insulation.', 0, 'sleeping-mats', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 100), (item_id, '3 Days', 150);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Sleeping Mat (Insulator - 1–2 Persons)', 'Thin reflective insulator mat for ground protection.', 0, 'sleeping-mats', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2-3 Days', 50);

    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Sleeping Mat (Insulator - 3–4 Persons)', 'Wide reflective insulator mat for ground protection.', 0, 'sleeping-mats', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2-3 Days', 100);


    -- === ELECTRONICS ===
    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Outdoor Ceiling Fan (Rechargeable)', 'Keep your tent cool with this portable rechargeable fan.', 0, 'electronics', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 100), (item_id, '3 Days', 150);


    -- === FOOTWEAR ===
    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Trekking Shoes', 'Durable hiking shoes available in various sizes.', 0, 'footwear', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, 'Women Size 7', 0), 
      (item_id, 'Women Size 8', 0),
      (item_id, 'Men Size 9', 0);


    -- === POWER EQUIPMENT ===
    INSERT INTO menu_items (name, description, base_price, category, available) 
    VALUES ('Portable Generator', 'Reliable power source for your camping needs.', 0, 'power', true)
    RETURNING id INTO item_id;
    INSERT INTO variations (menu_item_id, name, price) VALUES 
      (item_id, '2 Days', 1000), (item_id, '3 Days', 1500);

END $$;
