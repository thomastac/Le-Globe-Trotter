import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
      tip1, tip2, tip3, tip1_category, tip2_category, tip3_category, bon_plans,
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
    if (typeof bon_plans !== 'undefined') payload.bon_plans = bon_plans;

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

    console.log('📝 Received POST request for new submission:', {
      display_name: body.display_name,
      city: body.city,
      country: body.country,
      has_photo: !!body.photo_url,
      consent: body.consent_publication
    });

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

    // Sanitize coordinates: accept missing or invalid values as null.
    const safeLat = typeof latitude === 'number' && Number.isFinite(latitude) ? latitude : null;
    const safeLng = typeof longitude === 'number' && Number.isFinite(longitude) ? longitude : null;

    // Only the display name is strictly required at creation time.
    if (!display_name) {
      console.error('❌ Missing display_name');
      return NextResponse.json(
        { error: 'Missing required field: display_name' },
        { status: 400 }
      );
    }

    const submissionData = {
      display_name,
      phone,
      address_line,
      city,
      country,
      latitude: safeLat,
      longitude: safeLng,
      anecdote_text,
      photo_url,
      consent_publication,
    };

    console.log('💾 Inserting submission into database:', submissionData);

    const { data, error } = await supabaseAdmin
      .from('submissions')
      .insert([submissionData])
      .select('*')
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Successfully created submission:', data.id);
    return NextResponse.json({ submission: data }, { status: 201 });
  } catch (e: any) {
    console.error('❌ Unexpected error in POST /api/submissions:', e);
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 });
  }
}

// DELETE /api/submissions?id=<id>
export async function DELETE(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // First, check if submission exists
    const { data: existingSubmission, error: fetchError } = await supabaseAdmin
      .from('submissions')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingSubmission) {
      console.error('Submission not found:', id, fetchError);
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Delete the submission
    const { error } = await supabaseAdmin
      .from('submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error for submission', id, ':', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    console.log('✅ Successfully deleted submission:', id);
    return NextResponse.json({ success: true, message: 'Submission deleted successfully' }, { status: 200 });
  } catch (e: any) {
    console.error('Unexpected error during deletion:', e);
    return NextResponse.json({ error: e?.message ?? 'Unexpected error' }, { status: 500 });
  }
}

