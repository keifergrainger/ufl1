import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function TeamDetailsPage({ params }: { params: Promise<{ leagueId: string; teamId: string }> }) {
    const supabase = await createClient();
    const { leagueId, teamId } = await params;

    // 1. Fetch Team info
    const { data: team } = await supabase
        .from('fantasy_teams')
        .select('*')
        .eq('id', teamId)
        .single();

    if (!team) return <div className="p-12 text-center text-gray-500">Team not found.</div>;

    // 2. Fetch Roster
    const { data: roster } = await supabase
        .from('fantasy_rosters')
        .select(`
      slot,
      player:players (
        id, name, position, is_active,
        ufl_team:ufl_teams ( name, slug, primary_color )
      )
    `)
        .eq('team_id', teamId);

    // Group Roster
    const starters = roster?.filter((r: any) => r.slot && r.slot !== 'BENCH') || [];
    const bench = roster?.filter((r: any) => !r.slot || r.slot === 'BENCH') || [];

    // Sort starters by standard fantasy order usually, but here just alphabetically or slot for now
    const slotOrder = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF'];
    starters.sort((a: any, b: any) => {
        return slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot);
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-neutral-900 p-8 rounded-xl border border-white/5">
                <div className="flex items-center space-x-6 mb-4 md:mb-0">
                    <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-3xl font-black text-white">
                        {team.name.substring(0, 1)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">{team.name}</h1>
                        <p className="text-gray-400 font-mono">
                            {team.wins}-{team.losses}-{team.ties} <span className="text-gray-600 mx-2">|</span> {team.points_for} PF
                        </p>
                    </div>
                </div>
            </div>

            {/* Roster Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
                <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-white">Starting Lineup</h2>
                </div>
                <RosterTable entries={starters} emptyMessage="No starters set." />

                <div className="px-6 py-4 border-b border-neutral-800 border-t bg-neutral-950 mt-4">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-gray-400">Bench</h2>
                </div>
                <RosterTable entries={bench} emptyMessage="Bench is empty." />
            </div>
        </div>
    );
}

function RosterTable({ entries, emptyMessage }: { entries: any[], emptyMessage: string }) {
    if (entries.length === 0) {
        return <div className="p-6 text-center text-gray-500 italic">{emptyMessage}</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-neutral-900/50 text-gray-500 uppercase text-xs font-bold">
                    <tr>
                        <th className="px-6 py-3 w-20">Slot</th>
                        <th className="px-6 py-3">Player</th>
                        <th className="px-6 py-3">Position</th>
                        <th className="px-6 py-3">Team</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                    {entries.map((entry: any) => {
                        const p = entry.player;
                        return (
                            <tr key={p.id} className="hover:bg-neutral-800/50 transition">
                                <td className={`px-6 py-3 font-bold ${entry.slot === 'BENCH' ? 'text-gray-500' : 'text-blue-400'}`}>
                                    {entry.slot || 'BENCH'}
                                </td>
                                <td className="px-6 py-3 font-medium text-white">
                                    {p.name}
                                </td>
                                <td className="px-6 py-3 text-gray-400">
                                    {p.position}
                                </td>
                                <td className="px-6 py-3 text-gray-400">
                                    {p.ufl_team ? (
                                        <span style={{ color: p.ufl_team.primary_color }}>
                                            {p.ufl_team.name}
                                        </span>
                                    ) : 'FA'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
