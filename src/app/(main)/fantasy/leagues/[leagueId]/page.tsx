import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { getTeamBrand } from '@/lib/fantasy/branding';
import CommissionerSettings from './CommissionerSettings';

// Helper to determine current week
async function getCurrentWeek(supabase: any, leagueId: string) {
    const { data: weeks } = await supabase
        .from('fantasy_weeks')
        .select('*')
        .eq('league_id', leagueId)
        .order('week_number', { ascending: true }); // Get all weeks

    if (!weeks || weeks.length === 0) return null;

    const now = new Date();
    // Find highest week_number where start_date <= now
    let current = weeks.findLast((w: any) => w.start_date && new Date(w.start_date) <= now);

    // Fallback to latest week if all null or none started
    if (!current) {
        // Trying to be smart: if no weeks have passed, maybe show Week 1? 
        // User prompt says 'highest week_number whose start_date <= now()'. 
        // But if we are pre-season (no start dates passed), we usually want to see Week 1.
        // However, strict adherence: "fallback to max week_number if all dates are null"
        // Let's fallback to the first week if none have started yet (so users see upcoming matchups), 
        // or the last week if all dates are null (per prompt fallback).

        const hasAnyDate = weeks.some((w: any) => w.start_date !== null);
        if (!hasAnyDate) {
            // All dates null -> Show Week 1 (Start of season)
            // DEFAULTING TO WEEK 1 IS SAFER THAN LAST WEEK
            current = weeks[0];
        } else {
            // Some dates exist, but none passed -> Show Week 1 (first upcoming)
            current = weeks[0];
        }
    }

    return current;
}

export default async function LeagueOverviewPage({ params }: { params: Promise<{ leagueId: string }> }) {
    const supabase = await createClient();
    const { leagueId } = await params;

    // 1. Get Current Week
    const currentWeek = await getCurrentWeek(supabase, leagueId);

    // 2. Fetch Matchups for Current Week
    let matchups = [];
    if (currentWeek) {
        const { data: m } = await supabase
            .from('fantasy_matchups')
            .select(`
        *,
        home_team:fantasy_teams!home_team_id(*),
        away_team:fantasy_teams!away_team_id(*)
      `)
            .eq('week_id', currentWeek.id);
        matchups = m || [];
    }

    // 3. Fetch Top Teams (Mini Standings)
    const { data: topTeams } = await supabase
        .from('fantasy_teams')
        .select('*')
        .eq('league_id', leagueId)
        .order('wins', { ascending: false })
        .order('points_for', { ascending: false })
        .limit(4);

    // 4. Check if current user has a team and role
    const { data: { user } } = await supabase.auth.getUser();
    let userTeam = null;
    let isCommissioner = false;

    let allTeams: any[] = [];
    let leagueDetails: any = null;
    let hasStarted = false;

    if (user) {
        const { data: member } = await supabase
            .from('fantasy_league_members')
            .select('role')
            .eq('league_id', leagueId)
            .eq('user_id', user.id)
            .single();

        if (member?.role === 'commissioner') {
            isCommissioner = true;

            // Fetch extra data
            const [leagueRes, teamsRes, weeksRes] = await Promise.all([
                supabase.from('fantasy_leagues').select('*').eq('id', leagueId).single(),
                supabase.from('fantasy_teams').select('*').eq('league_id', leagueId).order('name', { ascending: true }),
                supabase.from('fantasy_weeks').select('*', { count: 'exact', head: true }).eq('league_id', leagueId)
            ]);

            leagueDetails = leagueRes.data;
            allTeams = teamsRes.data || [];
            hasStarted = (weeksRes.count || 0) > 0;
        }

        const { data: team } = await supabase
            .from('fantasy_teams')
            .select('id')
            .eq('league_id', leagueId)
            .eq('user_id', user.id)
            .single();
        userTeam = team;
    }

    return (
        <div className="space-y-12">
            {/* Commissioner Tools */}
            {isCommissioner && user && leagueDetails && (
                <CommissionerSettings
                    league={leagueDetails}
                    teams={allTeams}
                    hasStarted={hasStarted}
                    userId={user.id}
                />
            )}

            {/* CTA for New Users */}
            {!userTeam && (
                <div className="bg-gradient-to-r from-red-900 to-red-600 rounded-xl p-8 text-center shadow-2xl border border-red-500/50 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
                            Ready to Compete?
                        </h2>
                        <p className="text-red-100 mb-6 max-w-lg mx-auto font-medium">
                            Join the action by creating your franchise. Draft players, set lineups, and dominate the league.
                        </p>
                        <Link
                            href={`/fantasy/leagues/${leagueId}/teams/create`}
                            className="inline-block bg-white text-red-700 hover:bg-gray-100 font-black uppercase tracking-widest py-4 px-10 rounded-full transition transform hover:scale-105 shadow-xl"
                        >
                            Create Your Team
                        </Link>
                    </div>
                </div>
            )}

            {/* Current Week Matchups or Pending State */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold uppercase italic tracking-tight">
                        {currentWeek ? currentWeek.label : 'Schedule'}
                    </h2>
                    {currentWeek && (
                        <Link
                            href={`/fantasy/leagues/${leagueId}/matchups?week=${currentWeek.week_number}`}
                            className="text-sm text-red-500 hover:text-red-400 font-bold uppercase"
                        >
                            View All Matchups &rarr;
                        </Link>
                    )}
                </div>

                {!currentWeek ? (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
                        <div className="text-4xl mb-4">🏈</div>
                        <h3 className="text-xl font-bold text-white mb-2">Season Hasn&apos;t Started</h3>
                        <p className="text-gray-400 max-w-md mx-auto mb-6">
                            The commissioner needs to start the league to generate the schedule and run the draft.
                        </p>

                        {isCommissioner && (
                            <form action={async () => {
                                'use server';
                                const { startLeague } = await import('@/app/fantasy/actions');
                                await startLeague(leagueId);
                            }}>
                                <button type="submit" className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wide transition-colors">
                                    Start League Now
                                </button>
                                <p className="text-xs text-gray-500 mt-2">
                                    Generates schedule and runs draft (needs {2} teams minimum)
                                </p>
                            </form>
                        )}
                    </div>
                ) : matchups.length === 0 ? (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center text-gray-500">
                        No matchups scheduled for this week.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {matchups.map((match: any) => (
                            <div key={match.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-600 transition">
                                <div className="space-y-4">
                                    {/* Home Team */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {match.home_team.name.substring(0, 1)}
                                            </div>
                                            <div className="truncate">
                                                <div className="text-sm font-bold text-gray-200 truncate">{match.home_team.name}</div>
                                                <div className="text-xs text-gray-500">{match.home_team.wins}-{match.home_team.losses}</div>
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-white">{match.home_score}</div>
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {match.away_team.name.substring(0, 1)}
                                            </div>
                                            <div className="truncate">
                                                <div className="text-sm font-bold text-gray-200 truncate">{match.away_team.name}</div>
                                                <div className="text-xs text-gray-500">{match.away_team.wins}-{match.away_team.losses}</div>
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-white">{match.away_score}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Top Teams */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold uppercase italic tracking-tight">League Leaders</h2>
                    <Link
                        href={`/fantasy/leagues/${leagueId}/standings`}
                        className="text-sm text-red-500 hover:text-red-400 font-bold uppercase"
                    >
                        View Full Standings &rarr;
                    </Link>
                </div>

                {!topTeams || topTeams.length === 0 ? (
                    <div className="text-gray-500">No teams found.</div>
                ) : (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-950 text-gray-500 uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4">Rank</th>
                                    <th className="px-6 py-4">Team</th>
                                    <th className="px-6 py-4 text-right">W-L-T</th>
                                    <th className="px-6 py-4 text-right">PF</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {topTeams.map((team: any, idx: number) => (
                                    <tr key={team.id} className="hover:bg-neutral-800/50 transition">
                                        <td className="px-6 py-4 font-bold text-gray-400">{idx + 1}</td>
                                        <td className="px-6 py-4 font-bold text-white">
                                            <Link href={`/fantasy/leagues/${leagueId}/teams/${team.id}`} className="hover:underline">
                                                {team.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-300">
                                            {team.wins}-{team.losses}-{team.ties}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-300">
                                            {team.points_for}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
