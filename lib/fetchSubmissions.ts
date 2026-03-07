import { supabase } from './supabase';

export type Submission = {
  id: string;
  display_name: string;
  phone?: string | null;
  address_line: string | null;
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  anecdote_text: string | null;
  photo_url: string | null;
  tip1?: string | null;
  tip2?: string | null;
  tip3?: string | null;
  tip1_category?: string | null;
  tip2_category?: string | null;
  tip3_category?: string | null;
  travel_year?: number | null;
  travel_duration?: string | null;
  stage1?: string | null;
  stage2?: string | null;
  stage3?: string | null;
  submitted_at: string;
};

export async function fetchSubmissions(): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select(
      'id, display_name, address_line, city, country, latitude, longitude, anecdote_text, photo_url, tip1, tip1_category, tip2, tip2_category, tip3, tip3_category, bon_plans, travel_year, travel_duration, stage1, stage2, stage3, submitted_at'
    )
    .eq('consent_publication', true)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions', error);
    return [];
  }
  return (data ?? []) as Submission[];
}

export async function fetchRecentSubmissions(): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select(
      'id, display_name, phone, address_line, city, country, latitude, longitude, anecdote_text, photo_url, tip1, tip1_category, tip2, tip2_category, tip3, tip3_category, bon_plans, travel_year, travel_duration, stage1, stage2, stage3, submitted_at'
    )
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching recent submissions', error);
    return [];
  }
  return (data ?? []) as Submission[];
}
