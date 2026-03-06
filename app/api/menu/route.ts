import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        const supabase = getSupabaseAdmin();
        let query = supabase.from('menu_items').select('*').order('price', { ascending: true });

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const supabase = getSupabaseAdmin();

        // If adding a page, ensure we get the correct max price
        if (body.category === 'MenuPage' && typeof body.price === 'undefined') {
            const { data: maxData } = await supabase
                .from('menu_items')
                .select('price')
                .eq('category', 'MenuPage')
                .order('price', { ascending: false })
                .limit(1);
            const maxOrder = maxData && maxData.length > 0 ? maxData[0].price : -1;
            body.price = maxOrder + 1;
        }

        const { data, error } = await supabase.from('menu_items').insert(body).select();
        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from('menu_items').delete().eq('id', id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...updates } = body;
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.from('menu_items').update(updates).eq('id', id).select();
        if (error) throw error;

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
