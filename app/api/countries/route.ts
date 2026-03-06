import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function readCsvFallback(): Promise<{ code2: string; name: string }[]> {
  try {
    const p = path.join(process.cwd(), 'db', 'seed', 'countries_fr.csv');
    const txt = await fs.readFile(p, 'utf8');
    const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    const [header, ...rows] = lines;
    const cols = header.split(',').map(c => c.trim().toLowerCase());
    const iCode = cols.indexOf('code2');
    const iName = cols.indexOf('name');
    const out: { code2: string; name: string }[] = [];
    for (const r of rows) {
      const parts = r.split(',');
      const code2 = (parts[iCode] || '').trim().toLowerCase();
      const name = (parts[iName] || '').trim();
      if (code2 && name) out.push({ code2, name });
    }
    return out;
  } catch {
    return [];
  }
}

// GET /api/countries -> [{ code2: 'fr', name: 'France' }, ...]
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('countries')
      .select('code2, name')
      .order('name', { ascending: true });

    if (!error) {
      const list = (data ?? []).map((c: any) => ({ code2: String(c.code2).toLowerCase(), name: String(c.name) }));
      if (list.length) return NextResponse.json({ countries: list, source: 'db' }, { status: 200 });
    }
    // DB unavailable or empty -> CSV fallback
    const fall = await readCsvFallback();
    return NextResponse.json({ countries: fall, source: 'csv' }, { status: 200 });
  } catch {
    const fall = await readCsvFallback();
    return NextResponse.json({ countries: fall, source: 'csv' }, { status: 200 });
  }
}
