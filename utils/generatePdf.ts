import { PDFDocument } from 'pdf-lib';
import { Submission } from '@/lib/fetchSubmissions';

export async function generateWeeklyRecap(submissions: Submission[]) {
    const mergedPdf = await PDFDocument.create();

    for (const sub of submissions) {
        try {
            // Fetch the individual PDF for this submission
            // We assume the API is available at /api/pdf
            const response = await fetch(`/api/pdf?id=${sub.id}`);
            if (!response.ok) {
                console.warn(`Failed to fetch PDF for submission ${sub.id}`);
                continue;
            }
            const pdfBytes = await response.arrayBuffer();

            // Load the individual PDF
            const subPdf = await PDFDocument.load(pdfBytes);

            // Copy pages from individual PDF to merged PDF
            const copiedPages = await mergedPdf.copyPages(subPdf, subPdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (e) {
            console.error(`Error processing submission ${sub.id}`, e);
        }
    }

    const pdfBytes = await mergedPdf.save();
    return pdfBytes;
}
