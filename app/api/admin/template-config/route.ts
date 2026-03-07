import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const supabase = getSupabaseAdmin();
        const bucketName = 'config';
        const fileName = 'template_config.json';

        // Ensure bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find((b) => b.name === bucketName)) {
            await supabase.storage.createBucket(bucketName, { public: true });
        }

        // Upload config JSON file
        const { error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, JSON.stringify(body), {
                contentType: 'application/json',
                upsert: true
            });

        if (error) {
            console.error('Supabase admin error uploading config:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Vider le cache des cartes existantes pour forcer leur regénération avec le nouveau template
        const { data: files } = await supabase.storage.from('cartes').list();
        if (files && files.length > 0) {
            const fileNames = files.map(f => f.name);
            await supabase.storage.from('cartes').remove(fileNames);
            console.log(`Cache vidé: ${fileNames.length} cartes supprimées`);
        }

        return NextResponse.json({ success: true, url: supabase.storage.from(bucketName).getPublicUrl(fileName).data.publicUrl });
    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
