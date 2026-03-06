import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import path from 'path';
import fs from 'fs/promises';
import { PDFDocument, StandardFonts, rgb, pushGraphicsState, popGraphicsState, moveTo, lineTo, closePath, clip, endPath } from 'pdf-lib';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const W = 794;
const H = 1123;
const PAGE_W = W;
const PAGE_H = H;

function toPdfXYTopLeft(xTL: number, yTL: number, h: number = 0) {
  const x = xTL;
  const y = PAGE_H - yTL - h;
  return { x, y };
}

// (revert) remove center helper; use top-left drawing everywhere

function wrapText(text: string, font: any, size: number, maxWidth: number, maxLines?: number) {
  const words = (text ?? '').split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      cur = w;
      if (maxLines && lines.length >= maxLines - 1) break;
    }
  }
  if (cur) lines.push(cur);
  if (maxLines && lines.length > maxLines) lines.length = maxLines;
  if (maxLines && lines.length === maxLines) {
    const ell = '…';
    while (lines[maxLines - 1] && font.widthOfTextAtSize(lines[maxLines - 1] + ell, size) > maxWidth) {
      lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S+$/, '');
      if (!lines[maxLines - 1]) break;
    }
    lines[maxLines - 1] = lines[maxLines - 1] ? lines[maxLines - 1] + ell : ell;
  }
  return lines;
}

function drawTextTopLeft(page: any, text: string, xTL: number, yTL: number, opts: { font: any, size: number, color: any, maxWidth?: number, lineHeight?: number, maxLines?: number }) {
  const size = opts.size;
  const lh = opts.lineHeight ?? size * 1.3;
  const lines = wrapText(text, opts.font, size, opts.maxWidth ?? 1e9, opts.maxLines);
  let yCursor = yTL;
  for (const line of lines) {
    const { x, y } = toPdfXYTopLeft(xTL, yCursor, size);
    page.drawText(line, { x, y, size, font: opts.font, color: opts.color, maxWidth: opts.maxWidth });
    yCursor += lh;
  }
}

async function drawImageCoverTopLeft(doc: PDFDocument, page: any, imgBytes: Uint8Array, xTL: number, yTL: number, w: number, h: number) {
  let img: any;
  try { img = await doc.embedPng(imgBytes); } catch { img = await doc.embedJpg(imgBytes); }
  const imgW = img.width; const imgH = img.height;
  const scale = Math.max(w / imgW, h / imgH);
  const drawW = imgW * scale; const drawH = imgH * scale;
  const overflowX = (drawW - w) / 2; const overflowY = (drawH - h) / 2;
  const pos = toPdfXYTopLeft(xTL - overflowX, yTL - overflowY, drawH);

  const rect = toPdfXYTopLeft(xTL, yTL, h);
  page.pushOperators(
    pushGraphicsState(),
    moveTo(rect.x, rect.y),
    lineTo(rect.x + w, rect.y),
    lineTo(rect.x + w, rect.y + h),
    lineTo(rect.x, rect.y + h),
    closePath(),
    clip(),
    endPath()
  );

  page.drawImage(img, { x: pos.x, y: pos.y, width: drawW, height: drawH });

  page.pushOperators(popGraphicsState());
}

function formatDuration(d: string) {
  const t = (d || '').toLowerCase().replace(/\s+/g, '');
  if (!d) return '';
  if (/[<>]/.test(d)) return d;
  if (t.includes('lt3') || t.includes('moins3') || t.includes('under3') || t.includes('inf3')) return '< 3 mois';
  if (t.includes('3-6') || t.includes('3to6') || t.includes('entre3et6') || t.includes('3_6')) return '3 - 6 mois';
  if (t.includes('gt6') || t.includes('plus6') || t.includes('over6') || t.includes('sup6')) return '> 6 mois';
  if (/^\d+\s*-(\s*)?\d+/.test(d)) return d + ' mois';
  if (/^>\s*\d+/.test(d) || /^<\s*\d+/.test(d)) return d + ' mois';
  return d;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: s, error } = await supabase.from('submissions').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!s) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

    const fullName = String(s.display_name || '').trim();
    const country = String(s.country || '').trim();
    const city = String(s.city || s.address_line || '').trim();
    const duration = formatDuration(String(s.travel_duration || '').trim());
    const year = s.travel_year != null ? String(s.travel_year) : '';
    const stage1 = String(s.stage1 || '').trim();
    const stage2 = String(s.stage2 || '').trim();
    const stage3 = String(s.stage3 || '').trim();
    const tip1 = String(s.tip1 || '').trim();
    const tip2 = String(s.tip2 || '').trim();
    const tip3 = String(s.tip3 || '').trim();
    const anecdote = String(s.anecdote_text || '').trim();
    const photoUrl = String(s.photo_url || '').trim();

    // Build PDF with pdf-lib
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([PAGE_W, PAGE_H]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    // Background: prefer template.png; if absent, continue without background
    try {
      const pngPath = path.join(process.cwd(), 'template', 'template.png');
      const bgBytes = await fs.readFile(pngPath);
      const bgImg = await pdf.embedPng(bgBytes);
      page.drawImage(bgImg, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
    } catch {}

    // Photo COVER
    if (photoUrl) {
      try {
        const res = await fetch(photoUrl);
        const bytes = new Uint8Array(await res.arrayBuffer());
        await drawImageCoverTopLeft(pdf, page, bytes, 116, 112, 132, 132);
      } catch {}
    }

    // Country (text only)
    if (country) drawTextTopLeft(page, country, 122, 258, { font: fontBold, size: 13, color: rgb(0x22/255,0x22/255,0x22/255), maxWidth: 160 });

    // Name & Meta
    if (fullName) drawTextTopLeft(page, fullName, 300, 124, { font: fontBold, size: 20, color: rgb(0x22/255,0x22/255,0x22/255), maxWidth: 380 });
    const meta = [city, [duration, year].filter(Boolean).join(' / ')].filter(Boolean).join(' · ');
    if (meta) drawTextTopLeft(page, meta, 300, 152, { font, size: 12, color: rgb(0x22/255,0x22/255,0x22/255), maxWidth: 380 });

    // Steps (2 lines) - original coordinates
    if (stage1) drawTextTopLeft(page, stage1, 123, 403, { font, size: 12, color: rgb(0x22/255,0x22/255,0x22/255), maxWidth: 180, lineHeight: 15, maxLines: 2 });
    if (stage2) drawTextTopLeft(page, stage2, 324, 355, { font, size: 12, color: rgb(0x22/255,0x22/255,0x22/255), maxWidth: 200, lineHeight: 15, maxLines: 2 });
    if (stage3) drawTextTopLeft(page, stage3, 581, 294, { font, size: 12, color: rgb(0x22/255,0x22/255,0x22/255), maxWidth: 180, lineHeight: 15, maxLines: 2 });

    // Tips (3 lines) - original coordinates
    if (tip1) drawTextTopLeft(page, tip1, 372, 617, { font, size: 13, color: rgb(0x22/255,0x22/255,0x22/255), maxWidth: 220, lineHeight: 16, maxLines: 3 });
    if (tip2) drawTextTopLeft(page, tip2, 542, 698, { font, size: 13, color: rgb(0x22/255,0x22/255,0x22/255), maxWidth: 220, lineHeight: 16, maxLines: 3 });
    if (tip3) drawTextTopLeft(page, tip3, 680, 558, { font, size: 13, color: rgb(0x22/255,0x22/255,0x22/255), maxWidth: 220, lineHeight: 16, maxLines: 3 });

    // Story (clamped by lines) - original alignment
    const storyMaxLines = Math.floor(210 / 15);
    const storyLeft = 433 - Math.floor(574 / 2);
    if (anecdote) drawTextTopLeft(page, anecdote, storyLeft, 900, { font, size: 12, color: rgb(0x22/255,0x22/255,0x22/255), maxWidth: 574, lineHeight: 15, maxLines: storyMaxLines });

    // Debug: show converted coords
    const p = toPdfXYTopLeft(300, 124, 20);
    console.log('draw text (pdf coords): name ->', p.x, p.y);

    const bytes = await pdf.save();
    // Force a non-shared ArrayBuffer by copying into a fresh Uint8Array
    const copy = new Uint8Array(bytes.length);
    copy.set(bytes);
    const ab: ArrayBuffer = copy.buffer;
    return new NextResponse(ab, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="globetrotter_${id}.pdf"` } });
  } catch (e: any) {
    console.error('PDF error', e);
    return NextResponse.json({ error: e?.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
