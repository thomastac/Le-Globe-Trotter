import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const submissionId = searchParams.get('submissionId');

        if (!submissionId) {
            return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 });
        }

        const publicDir = path.join(process.cwd(), 'public', 'boarding-passes');
        const filePath = path.join(publicDir, `${submissionId}.png`);

        // Vérifier si le fichier existe
        if (fs.existsSync(filePath)) {
            // Supprimer le fichier
            fs.unlinkSync(filePath);
            return NextResponse.json({ success: true, message: 'Boarding pass deleted successfully' });
        } else {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error deleting boarding pass:', error);
        return NextResponse.json({ error: 'Failed to delete boarding pass' }, { status: 500 });
    }
}
