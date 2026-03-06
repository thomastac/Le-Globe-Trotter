import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabaseAdmin();

        // Get all submissions (bypassing RLS)
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('*')
            .order('submitted_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
        }

        if (!submissions) {
            return NextResponse.json({
                weeklySubmissions: [],
                totalSubmissions: 0,
                totalConsented: 0,
                recentSubmissions: [],
            });
        }

        // Calculate weekly stats
        const weeklyMap = new Map<string, { count: number; consented: number }>();

        submissions.forEach((sub) => {
            const date = new Date(sub.submitted_at);
            // Get ISO week number
            const year = date.getFullYear();
            const week = getISOWeek(date);
            const weekKey = `${year}-W${String(week).padStart(2, '0')}`;

            const current = weeklyMap.get(weekKey) || { count: 0, consented: 0 };
            current.count++;
            if (sub.consent_publication) current.consented++;
            weeklyMap.set(weekKey, current);
        });

        // Convert to array and sort by week (most recent first)
        const weeklySubmissions = Array.from(weeklyMap.entries())
            .map(([week, stats]) => ({ week, ...stats }))
            .sort((a, b) => b.week.localeCompare(a.week))
            .slice(0, 8); // Last 8 weeks

        // Calculate totals (totalSubmissions is now the highest submission_number)
        let highestNumber = 0;
        submissions.forEach(s => {
            if (s.submission_number > highestNumber) highestNumber = s.submission_number;
        });

        const totalSubmissions = highestNumber;
        const totalConsented = submissions.filter((s) => s.consent_publication).length;

        // Get recent submissions (last 20) with ALL fields
        const recentSubmissions = submissions.slice(0, 20).map((sub) => ({
            id: sub.id,
            submission_number: sub.submission_number,
            display_name: sub.display_name,
            country: sub.country || '',
            city: sub.city || '',
            submitted_at: sub.submitted_at,
            created_at: sub.created_at || sub.submitted_at,
            consent_publication: sub.consent_publication || false,
            photo_url: sub.photo_url || null,
            anecdote_text: sub.anecdote_text || null,
        }));

        // Get ALL submissions for the draw page
        const allSubmissions = submissions.map((sub) => ({
            id: sub.id,
            submission_number: sub.submission_number,
            display_name: sub.display_name,
            country: sub.country || '',
            city: sub.city || '',
            submitted_at: sub.submitted_at,
            created_at: sub.created_at || sub.submitted_at,
            consent_publication: sub.consent_publication || false,
            photo_url: sub.photo_url || null,
            anecdote_text: sub.anecdote_text || null,
        }));

        return NextResponse.json({
            weeklySubmissions,
            totalSubmissions,
            totalConsented,
            recentSubmissions,
            allSubmissions,
        });
    } catch (err: any) {
        console.error('Admin stats error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// Helper function to get ISO week number
function getISOWeek(date: Date): number {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}
