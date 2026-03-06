import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getTemplateConfig } from './templateConfig';

interface Submission {
  id: string;
  display_name: string;
  country: string;
  city: string;
  stage1?: string;
  stage2?: string;
  stage3?: string;
  photo_url?: string;
  anecdote_text?: string;
  bon_plans?: Array<{
    address?: string;
    description?: string;
    type?: string;
    latitude?: number | string;
    longitude?: number | string;
  }>;
}

export async function generateBoardingPassPDF(submission: Submission): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1240px';
  container.style.height = '1748px';
  document.body.appendChild(container);

  const stops = [submission.stage1, submission.stage2, submission.stage3].filter(Boolean);
  const bonPlans = submission.bon_plans?.slice(0, 3) || [];

  // Récupérer la configuration personnalisée
  const config = getTemplateConfig();
  const { backgroundImage, blocks } = config;

  // UTILISATION DE LA CONFIGURATION PERSONNALISÉE
  container.innerHTML = `
    <div style="
      position: relative;
      width: 1240px;
      height: 1748px;
      background: url('${backgroundImage}') center/cover no-repeat;
      font-family: 'Montserrat', 'Arial Black', sans-serif;
    ">
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
      
      <!-- Photo -->
      <div style="
        position: absolute;
        left: ${blocks.photo.left}px;
        top: ${blocks.photo.top}px;
        width: ${blocks.photo.width}px;
        height: ${blocks.photo.height}px;
        overflow: hidden;
        background: #c8d8d0;
      ">
        ${submission.photo_url ? `
          <img 
            src="${submission.photo_url}" 
            crossorigin="anonymous"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
        ` : `
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 80px;">🌍</div>
        `}
      </div>

      <!-- Arrêt 1 -->
      ${stops[0] ? `
        <div style="position: absolute; left: ${blocks.stop1.left}px; top: ${blocks.stop1.top}px; font-size: ${blocks.stop1.fontSize}px; font-weight: ${blocks.stop1.fontWeight}; color: ${blocks.stop1.color}; max-width: 200px; line-height: 1.2;">
          ${stops[0]}
        </div>
      ` : ''}

      <!-- Arrêt 2 -->
      ${stops[1] ? `
        <div style="position: absolute; left: ${blocks.stop2.left}px; top: ${blocks.stop2.top}px; font-size: ${blocks.stop2.fontSize}px; font-weight: ${blocks.stop2.fontWeight}; color: ${blocks.stop2.color}; max-width: 200px; line-height: 1.2;">
          ${stops[1]}
        </div>
      ` : ''}

      <!-- Arrêt 3 -->
      ${stops[2] ? `
        <div style="position: absolute; left: ${blocks.stop3.left}px; top: ${blocks.stop3.top}px; font-size: ${blocks.stop3.fontSize}px; font-weight: ${blocks.stop3.fontWeight}; color: ${blocks.stop3.color}; max-width: 200px; line-height: 1.2;">
          ${stops[2]}
        </div>
      ` : ''}

      <!-- Bon Plan 1 -->
      ${bonPlans[0] && blocks.bonPlan1 ? `
        <div style="position: absolute; left: ${blocks.bonPlan1.left}px; top: ${blocks.bonPlan1.top}px; font-size: ${blocks.bonPlan1.fontSize}px; font-weight: ${blocks.bonPlan1.fontWeight}; color: ${blocks.bonPlan1.color}; max-width: 200px; line-height: 1.2;">
          ${bonPlans[0].address || bonPlans[0].type || (bonPlans[0].latitude && bonPlans[0].longitude ? `${Number(bonPlans[0].latitude).toFixed(4)}, ${Number(bonPlans[0].longitude).toFixed(4)}` : 'Bon Plan 1')}
        </div>
      ` : ''}

      <!-- Bon Plan 2 -->
      ${bonPlans[1] && blocks.bonPlan2 ? `
        <div style="position: absolute; left: ${blocks.bonPlan2.left}px; top: ${blocks.bonPlan2.top}px; font-size: ${blocks.bonPlan2.fontSize}px; font-weight: ${blocks.bonPlan2.fontWeight}; color: ${blocks.bonPlan2.color}; max-width: 200px; line-height: 1.2;">
          ${bonPlans[1].address || bonPlans[1].type || (bonPlans[1].latitude && bonPlans[1].longitude ? `${Number(bonPlans[1].latitude).toFixed(4)}, ${Number(bonPlans[1].longitude).toFixed(4)}` : 'Bon Plan 2')}
        </div>
      ` : ''}

      <!-- Bon Plan 3 -->
      ${bonPlans[2] && blocks.bonPlan3 ? `
        <div style="position: absolute; left: ${blocks.bonPlan3.left}px; top: ${blocks.bonPlan3.top}px; font-size: ${blocks.bonPlan3.fontSize}px; font-weight: ${blocks.bonPlan3.fontWeight}; color: ${blocks.bonPlan3.color}; max-width: 200px; line-height: 1.2;">
          ${bonPlans[2].address || bonPlans[2].type || (bonPlans[2].latitude && bonPlans[2].longitude ? `${Number(bonPlans[2].latitude).toFixed(4)}, ${Number(bonPlans[2].longitude).toFixed(4)}` : 'Bon Plan 3')}
        </div>
      ` : ''}

      <!-- Nom -->
      <div style="position: absolute; left: ${blocks.name.left}px; top: ${blocks.name.top}px; font-size: ${blocks.name.fontSize}px; font-weight: ${blocks.name.fontWeight}; color: ${blocks.name.color}; text-transform: uppercase; letter-spacing: 3px;">
        ${submission.display_name}
      </div>

      <!-- Destination -->
      <div style="position: absolute; left: ${blocks.destination.left}px; top: ${blocks.destination.top}px; font-size: ${blocks.destination.fontSize}px; font-weight: ${blocks.destination.fontWeight}; color: ${blocks.destination.color};">
        ${submission.city}, ${submission.country}
      </div>

      <!-- Anecdote -->
      <div style="position: absolute; left: ${blocks.anecdote.left}px; top: ${blocks.anecdote.top}px; width: ${blocks.anecdote.width}px; font-size: ${blocks.anecdote.fontSize}px; font-weight: ${blocks.anecdote.fontWeight}; line-height: 1.5; color: ${blocks.anecdote.color}; max-height: 150px; overflow: hidden;">
        ${submission.anecdote_text || ''}
      </div>
    </div>
  `;

  await new Promise((resolve) => setTimeout(resolve, 500));

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
  });

  document.body.removeChild(container);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a6',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData, 'JPEG', 0, 0, 105, 148);

  const fileName = `carte-voyage-${submission.display_name.replace(/\s+/g, '-')}-${submission.city}.pdf`;
  pdf.save(fileName);
}
