-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Boissons', 'Plats', 'Snacks', 'Desserts', 'MenuPage')),
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Admin write access" ON menu_items FOR ALL USING (true) WITH CHECK (true); -- Simplified for demo

-- Seed data
INSERT INTO menu_items (name, description, price, category, image_url) VALUES
('GlobeTrotter Burger', 'Steak haché, cheddar, bacon, sauce maison, frites.', 16.50, 'Plats', '/img/menu/2.jpg'),
('Cocktail "Le Voyageur"', 'Rhum, fruit de la passion, citron vert, menthe.', 12.00, 'Boissons', '/img/menu/3.jpg'),
('Salade César', 'Poulet grillé, parmesan, croûtons, sauce césar.', 14.00, 'Plats', '/img/menu/6.jpg'),
('Tapas Mix', 'Assortiment de charcuteries et fromages du monde.', 18.00, 'Snacks', '/img/menu/7.jpg'),
('Cheesecake New-Yorkais', 'Coulis de fruits rouges.', 8.50, 'Desserts', '/img/menu/10.jpg'),
('Café Gourmand', 'Café accompagné de 3 mignardises.', 9.00, 'Desserts', '/img/menu/11.jpg');
