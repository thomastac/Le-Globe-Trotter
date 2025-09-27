import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client (Service Role). We avoid throwing at module import
// to prevent Next.js from rendering an HTML error page that the client cannot parse as JSON.
export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

  if (!supabaseUrl) {
    throw new Error('Missing env NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseServiceKey) {
    throw new Error('Missing env SUPABASE_SERVICE_ROLE_KEY (server only)');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
