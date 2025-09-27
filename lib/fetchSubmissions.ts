import { supabase } from './supabase';

export type Submission = {
  id: string;
  display_name: string;
  address_line: string | null;
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  anecdote_text: string | null;
  photo_url: string | null;
  submitted_at: string;
};

export async function fetchSubmissions(): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select(
      'id, display_name, address_line, city, country, latitude, longitude, anecdote_text, photo_url, submitted_at'
    )
    .eq('consent_publication', true)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions', error);
    return [];
  }
  return (data ?? []) as Submission[];
}
