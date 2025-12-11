import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function StandingsPage({ params }: { params: Promise<{ leagueId: string }> }) {
    const supabase = await createClient();
    const { leagueId } = await params;

    // Fetch Teams sorted by Wins DESC, Points For DESC
    const { data: teams, error } = await supabase
        .from('fantasy_teams')
        .select('*') // Removed user email join as it likely violates auth permissions
        .eq('league_id', leagueId)
        .order('wins', { ascending: false })
        .order('wins', { ascending: false })
        .order('wins', { ascending: false })
        .order('points_for', { ascending: false });

    if (error) {
        console.error('[Standings] Error fetching teams:', error);
    }
    console.log(`[Standings] League: ${leagueId}, Teams Found: ${teams?.length}`);
    if (teams?.length === 0) console.log('[Standings] No teams returned from DB.');

    // If no teams, we still render the table with an empty state
    const teamList = teams || [];

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950 flex justify-between items-center">
                <h2 className="text-xl font-bold uppercase italic tracking-tight text-white">Standings</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-neutral-950 text-gray-500 uppercase tracking-wider font-bold text-xs sticky top-0">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Team</th>
                            <th className="px-6 py-4">Owner</th>
                            <th className="px-6 py-4 text-right">W</th>
                            <th className="px-6 py-4 text-right">L</th>
                            <th className="px-6 py-4 text-right">T</th>
                            <th className="px-6 py-4 text-right">Pct</th>
                            <th className="px-6 py-4 text-right">PF</th>
                            <th className="px-6 py-4 text-right">PA</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {teamList.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-12 text-center text-gray-500 italic">
                                    No teams yet. Invite members or add CPU teams to populate the league.
                                </td>
                            </tr>
                        ) : (
                            teamList.map((team: any, idx: number) => {
                                const totalGames = team.wins + team.losses + team.ties;
                                const winPct = totalGames > 0 ? ((team.wins + (team.ties * 0.5)) / totalGames).toFixed(3) : '.000';

                                return (
                                    <tr key={team.id} className="hover:bg-neutral-800/50 transition">
                                        <td className="px-6 py-4 font-bold text-gray-400">{idx + 1}</td>
                                        <td className="px-6 py-4 font-bold text-white">
                                            <Link href={`/fantasy/leagues/${leagueId}/teams/${team.id}`} className="flex items-center space-x-3 group">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                    {team.name.substring(0, 1)}
                                                </div>
                                                <span className="group-hover:underline decoration-red-600 underline-offset-4">{team.name}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {team.user_id ? 'Member' : 'Guest'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-white">{team.wins}</td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-400">{team.losses}</td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-500">{team.ties}</td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-400">{winPct}</td>
                                        <td className="px-6 py-4 text-right font-mono text-green-500 font-bold">{team.points_for}</td>
                                        <td className="px-6 py-4 text-right font-mono text-red-500">{team.points_against}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
