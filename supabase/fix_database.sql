-- 1. Drop the table if it exists (to ensure a clean slate)
DROP TABLE IF EXISTS menu_items;

-- 2. Create the table with the correct 'MenuPage' category allowed
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  -- Note: 'MenuPage' is now included in the allowed categories
  category TEXT NOT NULL CHECK (category IN ('Boissons', 'Plats', 'Snacks', 'Desserts', 'MenuPage')),
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- 4. Create Access Policies
-- Allow everyone to read
CREATE POLICY "Public read access" ON menu_items FOR SELECT USING (true);
-- Allow everyone (or authenticated users) to write. 
-- Note: In a real app, you might restrict this to authenticated users only.
CREATE POLICY "Admin write access" ON menu_items FOR ALL USING (true) WITH CHECK (true);

-- 5. Refresh the API cache
NOTIFY pgrst, 'reload schema';
