import { createClient } from '@/lib/supabase-server';
import { notFound, redirect } from 'next/navigation';
import FantasyShell from '@/components/fantasy/FantasyShell';
import SettingsClient from './SettingsClient';

export default async function LeagueSettingsPage({ params }: { params: Promise<{ leagueId: string }> }) {
    const supabase = await createClient();
    const { leagueId } = await params;

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 2. Fetch League & Verify Commissioner
    const { data: league } = await supabase
        .from('fantasy_leagues')
        .select('*')
        .eq('id', leagueId)
        .single();

    if (!league) notFound();

    const { data: member } = await supabase
        .from('fantasy_league_members')
        .select('role')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .single();

    // 3. Strict Commissioner Access
    if (!member || member.role !== 'commissioner') {
        // Either redirect to dashboard or show 403
        redirect(`/fantasy/leagues/${leagueId}`);
    }

    // 4. Fetch Teams
    const { data: teams } = await supabase
        .from('fantasy_teams')
        .select('*')
        .eq('league_id', leagueId)
        .order('name');

    // 5. Check if Season Started (Has weeks generated?)
    const { count: weeksCount } = await supabase
        .from('fantasy_weeks')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', leagueId);

    const hasStarted = (weeksCount || 0) > 0;

    return (
        <FantasyShell>
            <div className="container mx-auto px-4 max-w-6xl py-12">
                <div className="mb-8 border-b border-white/10 pb-4">
                    <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter">
                        Commissioner Settings
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Manage your league configuration, teams, and schedule.
                    </p>
                </div>

                <SettingsClient
                    league={league}
                    teams={teams || []}
                    hasStarted={hasStarted}
                    userId={user.id}
                />
            </div>
        </FantasyShell>
    );
}
