import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get('image') as File;
        const submissionId = formData.get('submissionId') as string;

        if (!image || !submissionId) {
            return NextResponse.json(
                { error: 'Missing image or submissionId' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();
        const bucket = 'cartes';

        // S'assurer que le bucket existe
        const { data: buckets } = await supabase.storage.listBuckets();
        const exists = buckets?.some((b: any) => b.name === bucket);
        if (!exists) {
            await supabase.storage.createBucket(bucket, { public: true });
        }

        const arrayBuffer = await image.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const fileName = `${submissionId}.png`;

        // Uploader l'image
        const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, bytes, {
            contentType: 'image/png',
            upsert: true,
        });

        if (uploadError) {
            throw uploadError;
        }

        // --- Logique du plafond des 50 ---
        // Liste les fichiers par date de création, plus vieux d'abord
        const { data: filesList, error: listError } = await supabase.storage.from(bucket).list('', {
            limit: 200, // On liste assez large, le bucket ne doit pas dépasser ~50
            sortBy: { column: 'created_at', order: 'asc' }
        });

        if (!listError && filesList) {
            // Filtrer les fichiers "fantômes" de Next.js (par ex .emptyFolderPlaceholder)
            const actualFiles = filesList.filter(f => f.name.endsWith('.png'));
            
            if (actualFiles.length > 50) {
                // On veut en garder 50, on supprime les X plus vieux
                const numToDelete = actualFiles.length - 50;
                const filesToDelete = actualFiles.slice(0, numToDelete).map(f => f.name);
                
                if (filesToDelete.length > 0) {
                    await supabase.storage.from(bucket).remove(filesToDelete);
                    console.log(`Plafond atteint: supprimé ${filesToDelete.length} anciennes cartes.`);
                }
            }
        }

        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

        return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
        });
    } catch (error: any) {
        console.error('Error saving boarding pass to Supabase:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save image to cloud' },
            { status: 500 }
        );
    }
}
