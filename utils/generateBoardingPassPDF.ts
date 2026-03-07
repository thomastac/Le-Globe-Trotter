import { fetchTemplateConfig } from './templateConfig';

interface Submission {
  id: string;
  display_name: string;
  country: string;
  city: string;
  stage1?: string | null;
  stage2?: string | null;
  stage3?: string | null;
  photo_url?: string | null;
  anecdote_text?: string | null;
  tip1?: string | null;
  tip1_category?: string | null;
  tip2?: string | null;
  tip2_category?: string | null;
  tip3?: string | null;
  tip3_category?: string | null;
  bon_plans?: any[];
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
  
  let parsedBonPlans: any[] = [];
  if (Array.isArray(submission.bon_plans)) {
      parsedBonPlans = submission.bon_plans;
  } else if (typeof submission.bon_plans === 'string') {
      try {
          parsedBonPlans = JSON.parse(submission.bon_plans);
          if (!Array.isArray(parsedBonPlans)) parsedBonPlans = [];
      } catch (e) {
          console.error("Failed to parse bon_plans JSON string", e);
      }
  }

  const getAddressText = (bp: any, legacyAddress: any) => {
    if (bp?.address) return bp.address;
    if (bp?.latitude && bp?.longitude) return `📍 GPS: ${parseFloat(bp.latitude).toFixed(4)}, ${parseFloat(bp.longitude).toFixed(4)}`;
    return legacyAddress;
  };

  const bonPlans = [
    { type: parsedBonPlans[0]?.type || submission.tip1_category, address: getAddressText(parsedBonPlans[0], submission.tip1), description: parsedBonPlans[0]?.description || "" },
    { type: parsedBonPlans[1]?.type || submission.tip2_category, address: getAddressText(parsedBonPlans[1], submission.tip2), description: parsedBonPlans[1]?.description || "" },
    { type: parsedBonPlans[2]?.type || submission.tip3_category, address: getAddressText(parsedBonPlans[2], submission.tip3), description: parsedBonPlans[2]?.description || "" }
  ].filter(bp => bp.address || bp.description);

  // Récupérer la configuration personnalisée (Maintenant depuis Supabase)
  const config = await fetchTemplateConfig();
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
        left: ${blocks.photo?.left ?? 587}px;
        top: ${blocks.photo?.top ?? 60}px;
        width: ${blocks.photo?.width ?? 590}px;
        height: ${blocks.photo?.height ?? 663}px;
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
      ${stops[0] && blocks.stop1 ? `
        <div style="position: absolute; left: ${blocks.stop1.left}px; top: ${blocks.stop1.top}px; font-size: ${blocks.stop1.fontSize}px; font-weight: ${blocks.stop1.fontWeight}; color: ${blocks.stop1.color}; max-width: 200px; line-height: 1.2;">
          ${stops[0]}
        </div>
      ` : ''}

      <!-- Arrêt 2 -->
      ${stops[1] && blocks.stop2 ? `
        <div style="position: absolute; left: ${blocks.stop2.left}px; top: ${blocks.stop2.top}px; font-size: ${blocks.stop2.fontSize}px; font-weight: ${blocks.stop2.fontWeight}; color: ${blocks.stop2.color}; max-width: 200px; line-height: 1.2;">
          ${stops[1]}
        </div>
      ` : ''}

      <!-- Arrêt 3 -->
      ${stops[2] && blocks.stop3 ? `
        <div style="position: absolute; left: ${blocks.stop3.left}px; top: ${blocks.stop3.top}px; font-size: ${blocks.stop3.fontSize}px; font-weight: ${blocks.stop3.fontWeight}; color: ${blocks.stop3.color}; max-width: 200px; line-height: 1.2;">
          ${stops[2]}
        </div>
      ` : ''}

      <!-- Bon Plan 1 -->
      ${bonPlans[0] && blocks.bonPlan1 ? `
        <div style="position: absolute; left: ${blocks.bonPlan1.left}px; top: ${blocks.bonPlan1.top}px; font-size: ${blocks.bonPlan1.fontSize}px; font-weight: ${blocks.bonPlan1.fontWeight}; color: ${blocks.bonPlan1.color}; max-width: 200px; line-height: 1.2;">
          <div style="font-weight: bold; margin-bottom: 2px;">${bonPlans[0].address || bonPlans[0].type || 'Bon Plan 1'}</div>
          ${bonPlans[0].description ? `<div style="font-size: ${Math.max(10, (blocks.bonPlan1.fontSize || 16) - 4)}px; font-weight: normal; color: rgba(0,0,0,0.65); line-height: 1.3;">${bonPlans[0].description.length > 80 ? bonPlans[0].description.slice(0, 80) + '...' : bonPlans[0].description}</div>` : ''}
        </div>
      ` : ''}

      <!-- Bon Plan 2 -->
      ${bonPlans[1] && blocks.bonPlan2 ? `
        <div style="position: absolute; left: ${blocks.bonPlan2.left}px; top: ${blocks.bonPlan2.top}px; font-size: ${blocks.bonPlan2.fontSize}px; font-weight: ${blocks.bonPlan2.fontWeight}; color: ${blocks.bonPlan2.color}; max-width: 200px; line-height: 1.2;">
          <div style="font-weight: bold; margin-bottom: 2px;">${bonPlans[1].address || bonPlans[1].type || 'Bon Plan 2'}</div>
          ${bonPlans[1].description ? `<div style="font-size: ${Math.max(10, (blocks.bonPlan2.fontSize || 16) - 4)}px; font-weight: normal; color: rgba(0,0,0,0.65); line-height: 1.3;">${bonPlans[1].description.length > 80 ? bonPlans[1].description.slice(0, 80) + '...' : bonPlans[1].description}</div>` : ''}
        </div>
      ` : ''}

      <!-- Bon Plan 3 -->
      ${bonPlans[2] && blocks.bonPlan3 ? `
        <div style="position: absolute; left: ${blocks.bonPlan3.left}px; top: ${blocks.bonPlan3.top}px; font-size: ${blocks.bonPlan3.fontSize}px; font-weight: ${blocks.bonPlan3.fontWeight}; color: ${blocks.bonPlan3.color}; max-width: 200px; line-height: 1.2;">
          <div style="font-weight: bold; margin-bottom: 2px;">${bonPlans[2].address || bonPlans[2].type || 'Bon Plan 3'}</div>
          ${bonPlans[2].description ? `<div style="font-size: ${Math.max(10, (blocks.bonPlan3.fontSize || 16) - 4)}px; font-weight: normal; color: rgba(0,0,0,0.65); line-height: 1.3;">${bonPlans[2].description.length > 80 ? bonPlans[2].description.slice(0, 80) + '...' : bonPlans[2].description}</div>` : ''}
        </div>
      ` : ''}

      <!-- Nom -->
      ${blocks.name ? `
      <div style="position: absolute; left: ${blocks.name.left}px; top: ${blocks.name.top}px; font-size: ${blocks.name.fontSize}px; font-weight: ${blocks.name.fontWeight}; color: ${blocks.name.color}; text-transform: uppercase; letter-spacing: 3px;">
        ${submission.display_name}
      </div>
      ` : ''}

      <!-- Destination -->
      ${blocks.destination ? `
      <div style="position: absolute; left: ${blocks.destination.left}px; top: ${blocks.destination.top}px; font-size: ${blocks.destination.fontSize}px; font-weight: ${blocks.destination.fontWeight}; color: ${blocks.destination.color};">
        ${submission.city}, ${submission.country}
      </div>
      ` : ''}

      <!-- Anecdote -->
      ${blocks.anecdote ? `
      <div style="position: absolute; left: ${blocks.anecdote.left}px; top: ${blocks.anecdote.top}px; width: ${blocks.anecdote.width}px; font-size: ${blocks.anecdote.fontSize}px; font-weight: ${blocks.anecdote.fontWeight}; line-height: 1.5; color: ${blocks.anecdote.color}; max-height: 150px; overflow: hidden;">
        ${submission.anecdote_text || ''}
      </div>
      ` : ''}
    </div>
  `;

  await document.fonts.ready;
  // Fallback explicite pur CSS/font loading au cas où l'image logo peine
  await new Promise((resolve) => setTimeout(resolve, 50)); 

  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;

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
