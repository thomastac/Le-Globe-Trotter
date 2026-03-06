-- Drop the existing check constraint
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;

-- Add the new check constraint including 'MenuPage'
ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_check 
CHECK (category IN ('Boissons', 'Plats', 'Snacks', 'Desserts', 'MenuPage'));

-- Reload the schema cache (just in case)
NOTIFY pgrst, 'reload schema';
