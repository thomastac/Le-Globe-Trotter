import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const bucketName = 'config';
        const fileName = 'template_config.json';
        
        // Use download to get the file buffer
        const { data, error } = await supabase.storage
            .from(bucketName)
            .download(fileName);
            
        if (error) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        
        const text = await data.text();
        const json = JSON.parse(text);
        
        return NextResponse.json(json);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
