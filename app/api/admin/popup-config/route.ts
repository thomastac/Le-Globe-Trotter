import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const supabase = getSupabaseAdmin();

        const { error } = await supabase
            .from('site_settings')
            .upsert({
                id: 'global_popup',
                ...body,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Supabase admin error upserting config:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
