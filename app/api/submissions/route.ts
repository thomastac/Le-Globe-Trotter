import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// POST /api/submissions
// Body JSON:
// {
//   display_name: string,
//   address_line?: string,
//   city?: string,
//   country?: string,
//   latitude: number,
//   longitude: number,
//   anecdote_text?: string,
//   photo_url?: string,
//   consent_publication?: boolean
// }

// GET /api/submissions?id=<id>
export async function GET(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Fetch error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ submission: data }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 });
  }
}

// PATCH /api/submissions
// Body JSON:
// {
//   id: string | number (required),
//   travel_duration?: string,   // '<3' | '3-6' | '>6'
//   travel_year?: number,
//   travel_context?: string,    // one of predefined or 'other'
//   travel_context_other?: string | null,
//   stage1?: string,
//   stage2?: string,
//   stage3?: string,
//   tip1?: string,
//   tip2?: string,
//   tip3?: string,
//   tip1_category?: string,
//   tip2_category?: string,
//   tip3_category?: string
// }
export async function PATCH(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const { id, travel_duration, travel_year, travel_context, travel_context_other, stage1, stage2, stage3,
      tip1, tip2, tip3, tip1_category, tip2_category, tip3_category,
      display_name, phone, city, country, latitude, longitude, address_line, anecdote_text, photo_url, consent_publication } = body ?? {};

    if (id == null) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Build a safe update payload including only defined keys
    const payload: Record<string, any> = {};
    if (typeof travel_duration !== 'undefined') payload.travel_duration = travel_duration;
    if (typeof travel_year !== 'undefined') payload.travel_year = travel_year;
    if (typeof travel_context !== 'undefined') payload.travel_context = travel_context;
    if (typeof travel_context_other !== 'undefined') payload.travel_context_other = travel_context_other;
    if (typeof stage1 !== 'undefined') payload.stage1 = stage1;
    if (typeof stage2 !== 'undefined') payload.stage2 = stage2;
    if (typeof stage3 !== 'undefined') payload.stage3 = stage3;
    // Step 3 fields (tips + categories)
    if (typeof tip1 !== 'undefined') payload.tip1 = tip1;
    if (typeof tip2 !== 'undefined') payload.tip2 = tip2;
    if (typeof tip3 !== 'undefined') payload.tip3 = tip3;
    if (typeof tip1_category !== 'undefined') payload.tip1_category = tip1_category;
    if (typeof tip2_category !== 'undefined') payload.tip2_category = tip2_category;
    if (typeof tip3_category !== 'undefined') payload.tip3_category = tip3_category;
    // Step 1 fields
    if (typeof display_name !== 'undefined') payload.display_name = display_name;
    if (typeof phone !== 'undefined') payload.phone = phone;
    if (typeof city !== 'undefined') payload.city = city;
    if (typeof country !== 'undefined') payload.country = country;
    if (typeof latitude !== 'undefined') payload.latitude = latitude;
    if (typeof longitude !== 'undefined') payload.longitude = longitude;
    if (typeof address_line !== 'undefined') payload.address_line = address_line;
    if (typeof anecdote_text !== 'undefined') payload.anecdote_text = anecdote_text;
    if (typeof photo_url !== 'undefined') payload.photo_url = photo_url;
    if (typeof consent_publication !== 'undefined') payload.consent_publication = consent_publication;

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('submissions')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Update error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submission: data }, { status: 200 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();

    const {
      display_name,
      phone = null,
      address_line = null,
      city = null,
      country = null,
      latitude,
      longitude,
      anecdote_text = null,
      photo_url = null,
      consent_publication = true,
    } = body ?? {};

    if (!display_name || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: display_name, latitude, longitude' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('submissions')
      .insert([
        {
          display_name,
          phone,
          address_line,
          city,
          country,
          latitude,
          longitude,
          anecdote_text,
          photo_url,
          consent_publication,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Insert error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submission: data }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
