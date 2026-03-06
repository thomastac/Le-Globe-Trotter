import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

        // Créer le dossier cartes s'il n'existe pas
        const cardsDir = path.join(process.cwd(), 'public', 'cartes');
        try {
            await mkdir(cardsDir, { recursive: true });
        } catch (err) {
            // Le dossier existe déjà, c'est OK
        }

        // Convertir le blob en buffer
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sauvegarder l'image
        const filePath = path.join(cardsDir, `${submissionId}.png`);
        await writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            url: `/cartes/${submissionId}.png`,
        });
    } catch (error: any) {
        console.error('Error saving boarding pass:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to save image' },
            { status: 500 }
        );
    }
}
