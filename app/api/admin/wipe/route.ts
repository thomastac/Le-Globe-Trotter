import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Danger: wipes table `submissions` and all files in storage bucket `photos`.
// Protected by header x-wipe-secret which must match process.env.ADMIN_WIPE_SECRET.
export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-wipe-secret');
    if (!process.env.ADMIN_WIPE_SECRET) {
      return NextResponse.json({ error: 'Missing server env ADMIN_WIPE_SECRET' }, { status: 500 });
    }
    if (secret !== process.env.ADMIN_WIPE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // 1) Delete all rows from submissions
    const { error: delErr } = await supabase.from('submissions').delete().neq('id', 0);
    if (delErr) {
      return NextResponse.json({ error: `Delete submissions failed: ${delErr.message}` }, { status: 500 });
    }

    // 2) Delete all files in storage bucket `photos` (if exists)
    const bucket = 'photos';
    const { data: buckets, error: lbErr } = await supabase.storage.listBuckets();
    if (lbErr) {
      return NextResponse.json({ error: `List buckets failed: ${lbErr.message}` }, { status: 500 });
    }
    const exists = buckets?.some((b: any) => b.name === bucket);
    let removed = 0;
    if (exists) {
      const { data: files, error: listErr } = await supabase.storage.from(bucket).list('', { limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } });
      if (listErr) {
        return NextResponse.json({ error: `List files failed: ${listErr.message}` }, { status: 500 });
      }
      const paths = (files || []).map((f) => f.name);
      if (paths.length) {
        const { error: remErr } = await supabase.storage.from(bucket).remove(paths);
        if (remErr) {
          return NextResponse.json({ error: `Remove files failed: ${remErr.message}` }, { status: 500 });
        }
        removed = paths.length;
      }
    }

    return NextResponse.json({ ok: true, removedPhotos: removed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Wipe failed' }, { status: 500 });
  }
}
