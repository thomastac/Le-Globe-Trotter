import { Submission } from '@/lib/fetchSubmissions';

/**
 * Escapes a string for use in XML
 * @param str The string to escape
 */
function escapeXml(str: string): string {
    if (!str) return '';
    return str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

/**
 * Generates and triggers download of a KML file containing the provided submissions
 * @param submissions Array of submissions to include in the KML
 * @param filename Name of the file to download
 */
export function generateKml(submissions: Submission[], filename: string = 'mes-decouvertes-globetrotter.kml') {
    if (!submissions || submissions.length === 0) return;

    const documentName = escapeXml(filename.replace('.kml', ''));
    const documentDescription = `Généré depuis GlobeTrotter le ${new Date().toLocaleDateString('fr-FR')}`;

    // Build the placemarks (points)
    const placemarks = submissions.map((s) => {
        // KML expects coordinates as: longitude,latitude,altitude
        const lon = s.longitude;
        const lat = s.latitude;
        // Skip if coordinates are invalid
        if (lon == null || lat == null || isNaN(lon) || isNaN(lat)) return '';

        const title = escapeXml(s.display_name || 'Anecdote');

        // Construct rich HTML description
        let descHtml = `
      <h3>Anecdote par ${escapeXml(s.display_name || '')}</h3>
    `.trim();

        if (s.country || s.city) {
            descHtml += `<p><strong>Localisation:</strong> ${escapeXml([s.city, s.country].filter(Boolean).join(', '))}</p>`;
        }

        if (s.anecdote_text) {
            descHtml += `
        <hr/>
        <p><em>"${escapeXml(s.anecdote_text)}"</em></p>
      `;
        }

        // Wrap the CDATA properly so HTML works in Google Maps
        const descCdata = `<![CDATA[${descHtml}]]>`;

        return `
      <Placemark>
        <name>${title}</name>
        <description>${descCdata}</description>
        <Point>
          <coordinates>${lon},${lat},0</coordinates>
        </Point>
      </Placemark>
    `.trim();
    }).filter(Boolean).join('\n');

    // KML Wrapper
    const kmlData = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${documentName}</name>
    <description>${documentDescription}</description>
    ${placemarks}
  </Document>
</kml>`.trim();

    // Trigger download
    const blob = new Blob([kmlData], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
}
