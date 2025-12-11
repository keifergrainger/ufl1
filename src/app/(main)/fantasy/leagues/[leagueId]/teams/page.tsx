import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TeamsListPage({ params }: { params: Promise<{ leagueId: string }> }) {
    const supabase = await createClient();
    const { leagueId } = await params;

    const { data: teams } = await supabase
        .from('fantasy_teams')
        .select('*')
        .eq('league_id', leagueId)
        .order('name', { ascending: true });

    if (!teams || teams.length === 0) {
        return (
            <div className="p-12 text-center border border-dashed border-gray-800 rounded-xl">
                <p className="text-gray-500 mb-6">No teams found in this league.</p>
                <Link
                    href={`/fantasy/leagues/${leagueId}/teams/create`}
                    className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider py-3 px-8 rounded transition"
                >
                    Create a Team
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <Link
                    href={`/fantasy/leagues/${leagueId}/teams/create`}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs py-2 px-4 rounded transition border border-white/10"
                >
                    + Add Team
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teams.map((team: any) => (
                    <Link
                        key={team.id}
                        href={`/fantasy/leagues/${leagueId}/teams/${team.id}`}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-600 transition group"
                    >
                        <div className="p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    {team.name.substring(0, 1)}
                                </div>
                                <div className="overflow-hidden">
                                    <h3 className="text-lg font-bold text-white truncate group-hover:underline decoration-red-600 underline-offset-4">{team.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{team.user_id ? 'Member Member' : 'Guest Team'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Record</div>
                                    <div className="text-xl font-mono font-medium text-white">{team.wins}-{team.losses}-{team.ties}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase font-bold">Points</div>
                                    <div className="text-xl font-mono font-medium text-white">{team.points_for}</div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
