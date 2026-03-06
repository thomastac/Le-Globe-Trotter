import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { PDFDocument } from 'pdf-lib';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // 0 = Monday
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fromParam = url.searchParams.get('from');
    const toParam = url.searchParams.get('to');

    // Default: current week [Mon 00:00; next Mon 00:00)
    const now = new Date();
    const weekStart = fromParam ? new Date(fromParam) : startOfWeekMonday(now);
    const weekEnd = toParam ? new Date(toParam) : addDays(weekStart, 7);

    const supabase = getSupabaseAdmin();
    const { data: rows, error } = await supabase
      .from('submissions')
      .select('*')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', weekEnd.toISOString());

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 0) {
      return NextResponse.json({ error: 'Aucune contribution dans cet intervalle' }, { status: 404 });
    }

    // Order by country, then created_at
    list.sort((a: any, b: any) => {
      const ca = (a.country || '').localeCompare(b.country || '');
      if (ca !== 0) return ca;
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    });

    // Build combined PDF by merging individual PDFs
    const combined = await PDFDocument.create();

    for (const row of list) {
      try {
        const pdfUrl = new URL(`/api/pdf?id=${encodeURIComponent(String(row.id))}`, url);
        const res = await fetch(pdfUrl.toString());
        if (!res.ok) continue;
        const bytes = await res.arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const pages = await combined.copyPages(src, src.getPageIndices());
        pages.forEach((p) => combined.addPage(p));
      } catch {}
    }

    const out = await combined.save();
    const fromStr = weekStart.toISOString().slice(0, 10);
    const toStr = weekEnd.toISOString().slice(0, 10);
    const ab = new Uint8Array(out).buffer as ArrayBuffer;
    return new NextResponse(ab, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="globetrotter_week_${fromStr}_to_${toStr}.pdf"`
      },
    });
  } catch (e: any) {
    console.error('Weekly report error', e);
    return NextResponse.json({ error: e?.message || 'Failed to build weekly report' }, { status: 500 });
  }
}
