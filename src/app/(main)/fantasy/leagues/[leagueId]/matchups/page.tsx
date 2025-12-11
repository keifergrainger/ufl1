import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MatchupsPage({
    params,
    searchParams
}: {
    params: Promise<{ leagueId: string }>;
    searchParams: Promise<{ week?: string }>;
}) {
    const supabase = await createClient();
    const { leagueId } = await params;
    const { week } = await searchParams;

    // 1. Fetch all weeks for the dropdown
    const { data: weeks } = await supabase
        .from('fantasy_weeks')
        .select('*')
        .eq('league_id', leagueId)
        .order('week_number', { ascending: true });

    if (!weeks || weeks.length === 0) {
        return <div className="p-12 text-center text-gray-500">No schedule created for this league yet.</div>;
    }

    // 2. Determine selected week
    let selectedWeekNumber = week ? parseInt(week) : 1;
    const selectedWeek = weeks.find((w: any) => w.week_number === selectedWeekNumber) || weeks[0];

    // 3. Fetch Matchups for selected week
    const { data: matchups } = await supabase
        .from('fantasy_matchups')
        .select(`
      *,
      home_team:fantasy_teams!home_team_id(*),
      away_team:fantasy_teams!away_team_id(*)
    `)
        .eq('week_id', selectedWeek.id);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center bg-neutral-900 p-6 rounded-xl border border-white/5">
                <div>
                    <h2 className="text-2xl font-bold uppercase italic tracking-tight text-white mb-2">Scores & Schedule</h2>
                    <p className="text-gray-400 text-sm">View weekly matchup results.</p>
                </div>

                {/* Week Selector */}
                <div className="mt-4 sm:mt-0">
                    <label className="mr-3 text-sm font-bold uppercase text-gray-500">Week</label>
                    <div className="inline-flex rounded-md shadow-sm">
                        {weeks.map((week: any) => (
                            <Link
                                key={week.id}
                                href={`/fantasy/leagues/${leagueId}/matchups?week=${week.week_number}`}
                                className={`
                    px-4 py-2 text-sm font-bold uppercase border border-neutral-700 first:rounded-l-md last:rounded-r-md
                    ${week.week_number === selectedWeek.week_number
                                        ? 'bg-red-600 text-white border-red-600'
                                        : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'}
                  `}
                            >
                                {week.week_number}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {!matchups || matchups.length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
                    <p className="text-xl text-gray-500 font-medium">No matchups found for Week {selectedWeek.week_number}.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {matchups.map((match: any) => (
                        <div key={match.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-600 transition group flex flex-col md:flex-row">
                            {/* Home Team */}
                            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-white/5 relative">
                                <div className="mb-2 w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-500">
                                    {match.home_team.name.substring(0, 1)}
                                </div>
                                <h3 className={`text-lg font-bold ${Number(match.home_score) > Number(match.away_score) ? 'text-white' : 'text-gray-400'}`}>
                                    {match.home_team.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">{match.home_team.wins}-{match.home_team.losses}</p>
                                <div className="text-4xl font-black text-white font-mono">{match.home_score}</div>
                            </div>

                            {/* VS Divider */}
                            <div className="px-4 py-2 bg-black/40 flex items-center justify-center md:hidden text-xs font-bold text-gray-600 uppercase">
                                VS
                            </div>

                            {/* Away Team */}
                            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                                <div className="mb-2 w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-500">
                                    {match.away_team.name.substring(0, 1)}
                                </div>
                                <h3 className={`text-lg font-bold ${Number(match.away_score) > Number(match.home_score) ? 'text-white' : 'text-gray-400'}`}>
                                    {match.away_team.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">{match.away_team.wins}-{match.away_team.losses}</p>
                                <div className="text-4xl font-black text-white font-mono">{match.away_score}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
