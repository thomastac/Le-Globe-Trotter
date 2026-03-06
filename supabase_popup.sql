-- Création de la table pour les réglages globaux du site
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    is_popup_enabled BOOLEAN DEFAULT false,
    popup_image_url TEXT,
    popup_text TEXT,
    popup_text_color TEXT DEFAULT '#000000',
    popup_text_size INTEGER DEFAULT 24,
    popup_text_x INTEGER DEFAULT 50,
    popup_text_y INTEGER DEFAULT 50,
    popup_text_weight INTEGER DEFAULT 600,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Activation de RLS (Row Level Security) - Optionnel mais recommandé
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tout le monde de lire les réglages (pour afficher le pop-up)
DROP POLICY IF EXISTS "Allow public read access on site_settings" ON public.site_settings;
CREATE POLICY "Allow public read access on site_settings" 
ON public.site_settings FOR SELECT 
USING (true);

-- Politique pour permettre uniquement à l'admin (via Service Role Key ou code API serveur) de modifier
DROP POLICY IF EXISTS "Allow service role update on site_settings" ON public.site_settings;
CREATE POLICY "Allow service role update on site_settings" 
ON public.site_settings FOR ALL 
USING (true) WITH CHECK (true);

-- Insertion de la ligne par défaut (id unique fixé à 'global_popup')
INSERT INTO public.site_settings (
    id, is_popup_enabled, popup_image_url, popup_text, popup_text_color, popup_text_size, popup_text_x, popup_text_y, popup_text_weight
) VALUES (
    'global_popup',
    false,
    '',
    'Bienvenue sur GlobeTrotter !',
    '#1a1a1a',
    28,
    300,
    150,
    800
) ON CONFLICT (id) DO NOTHING;
