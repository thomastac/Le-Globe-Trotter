import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const supabase = getSupabaseAdmin();
    const results = {
        get: null as any,
        insert: null as any,
        delete: null as any,
        errors: [] as any[]
    };

    try {
        // Test GET
        const { data: getData, error: getError } = await supabase.from('menu_items').select('*').limit(1);
        if (getError) {
            results.errors.push({ op: 'GET', error: getError });
        } else {
            results.get = getData;
        }

        // Test INSERT
        const testItem = {
            name: 'Test Item',
            category: 'MenuPage',
            image_url: 'https://example.com/test.jpg',
            price: 9999,
            active: false
        };
        const { data: insertData, error: insertError } = await supabase.from('menu_items').insert(testItem).select();
        if (insertError) {
            results.errors.push({ op: 'INSERT', error: insertError });
        } else {
            results.insert = insertData;
            // Test DELETE
            if (insertData && insertData.length > 0) {
                const { error: deleteError } = await supabase.from('menu_items').delete().eq('id', insertData[0].id);
                if (deleteError) {
                    results.errors.push({ op: 'DELETE', error: deleteError });
                } else {
                    results.delete = 'Success';
                }
            }
        }

        return NextResponse.json(results);
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
