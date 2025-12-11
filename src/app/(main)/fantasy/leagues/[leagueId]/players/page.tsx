import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Player } from '@/types/fantasy';

export default async function PlayersPage({
    params,
    searchParams
}: {
    params: Promise<{ leagueId: string }>;
    searchParams: Promise<{ position?: string; search?: string }>;
}) {
    const supabase = await createClient();
    const { leagueId } = await params;
    const { position: positionFilter = 'ALL', search: searchTerm = '' } = await searchParams;

    // 1. Fetch ALL Players (with Team)
    let query = supabase
        .from('players')
        .select('*, ufl_team:ufl_teams(*)');

    if (positionFilter !== 'ALL') {
        query = query.eq('position', positionFilter);
    }
    if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data: players } = await query.order('name');

    if (!players) return <div>No players found.</div>;

    // 2. Fetch Ownership (Rosters for this league)
    // We need to know which players are owned by teams in THIS league.
    // Join fantasy_rosters -> fantasy_teams (filter by league_id)
    const { data: rostered } = await supabase
        .from('fantasy_rosters')
        .select('player_id, team:fantasy_teams!inner(id, name, league_id)')
        .eq('team.league_id', leagueId);

    // Map player_id -> team name
    const ownershipMap = new Map<string, string>();
    rostered?.forEach((r: any) => {
        ownershipMap.set(r.player_id, r.team.name);
    });

    const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                    {positions.map((pos) => (
                        <Link
                            key={pos}
                            href={`/fantasy/leagues/${leagueId}/players?position=${pos}${searchTerm ? `&search=${searchTerm}` : ''}`}
                            className={`px-3 py-1.5 rounded text-sm font-bold uppercase ${positionFilter === pos
                                ? 'bg-white text-black'
                                : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                                }`}
                        >
                            {pos}
                        </Link>
                    ))}
                </div>

                <form className="w-full md:w-auto">
                    <input
                        name="search"
                        placeholder="Search players..."
                        defaultValue={searchTerm}
                        className="w-full md:w-64 bg-neutral-950 border border-neutral-800 text-white px-3 py-1.5 rounded text-sm focus:outline-none focus:border-white/20"
                    />
                    {positionFilter !== 'ALL' && <input type="hidden" name="position" value={positionFilter} />}
                </form>
            </div>

            {/* Players Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-950 text-gray-500 uppercase tracking-wider font-bold text-xs">
                            <tr>
                                <th className="px-6 py-3">Player</th>
                                <th className="px-6 py-3">Team</th>
                                <th className="px-6 py-3">Position</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {players.map((p: any) => {
                                const ownerName = ownershipMap.get(p.id);
                                return (
                                    <tr key={p.id} className="hover:bg-neutral-800/50 transition">
                                        <td className="px-6 py-3 font-bold text-white">{p.name}</td>
                                        <td className="px-6 py-3 text-gray-400">
                                            {p.ufl_team ? (
                                                <span style={{ color: p.ufl_team.primary_color }}>{p.ufl_team.slug}</span>
                                            ) : 'FA'}
                                        </td>
                                        <td className="px-6 py-3 font-mono text-gray-400">{p.position}</td>
                                        <td className="px-6 py-3">
                                            {ownerName ? (
                                                <span className="text-gray-400 text-xs uppercase font-bold">
                                                    Owned by {ownerName}
                                                </span>
                                            ) : (
                                                <span className="text-green-500 text-xs uppercase font-bold bg-green-500/10 px-2 py-1 rounded">
                                                    Free Agent
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
