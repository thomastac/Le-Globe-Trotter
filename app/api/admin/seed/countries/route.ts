import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseCsv(content: string): { code2: string; name: string }[] {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const [header, ...rows] = lines;
  const cols = header.split(',').map(c => c.trim().toLowerCase());
  const idxCode = cols.indexOf('code2');
  const idxName = cols.indexOf('name');
  const out: { code2: string; name: string }[] = [];
  for (const r of rows) {
    const parts = r.split(',');
    const code2 = (parts[idxCode] || '').trim().toLowerCase();
    const name = (parts[idxName] || '').trim();
    if (code2 && name) out.push({ code2, name });
  }
  return out;
}

export async function POST() {
  try {
    const csvPath = path.join(process.cwd(), 'db', 'seed', 'countries_fr.csv');
    const content = await fs.readFile(csvPath, 'utf8');
    const items = parseCsv(content);
    if (!items.length) return NextResponse.json({ error: 'CSV vide' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    // Upsert par lots pour éviter des payloads trop gros
    const chunkSize = 500;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const { error } = await supabase.from('countries').upsert(chunk, { onConflict: 'code2' });
      if (error) return NextResponse.json({ error: error.message, at: i }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: items.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Seed failed' }, { status: 500 });
  }
}
