import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 'global_popup')
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Not Found", which is fine if missing
            console.error('API Error fetching popup config:', error);
            return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
        }

        // Return the config or defaults if not found
        return NextResponse.json(data || {
            is_popup_enabled: false,
            popup_image_url: '',
            popup_text: 'Bienvenue sur GlobeTrotter !',
            popup_text_color: '#1a1a1a',
            popup_text_size: 28,
            popup_text_x: 300,
            popup_text_y: 150,
            popup_text_weight: 800
        });
    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
