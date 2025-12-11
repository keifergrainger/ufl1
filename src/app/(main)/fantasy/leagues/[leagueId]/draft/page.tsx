import InitializeDraftButton from './InitializeDraftButton';
import { createClient } from '@/lib/supabase-server';

// ... 

export default async function DraftPage({ params }: { params: Promise<{ leagueId: string }> }) {
    const supabase = await createClient();
    const { leagueId } = await params;

    // 1. Fetch League Teams (for columns)
    const { data: teams } = await supabase
        .from('fantasy_teams')
        .select('id, name')
        .eq('league_id', leagueId)
        .order('name', { ascending: true }); // Standard sorting for now, ideally draft order

    // 2. Fetch Picks
    const { data: picks } = await supabase
        .from('fantasy_draft_picks')
        .select(`
      *,
      player:players(name, position, ufl_team:ufl_teams(slug, primary_color))
    `)
        .eq('league_id', leagueId);

    // Check if user is commissioner (only needed if picks are empty)
    let isCommissioner = false;
    // We can do a quick check if needed, or lazily relies on RLS/Action. 
    // But to show the button conditionally:
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: member } = await supabase
            .from('fantasy_league_members')
            .select('role')
            .eq('league_id', leagueId)
            .eq('user_id', user.id)
            .single();
        if (member && member.role === 'commissioner') {
            isCommissioner = true;
        }
    }

    if (!teams || teams.length === 0) {
        return <div className="p-12 text-center text-gray-500">No teams in this league.</div>;
    }

    if (!picks || picks.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed border-neutral-800 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-2">Draft Not Configured</h3>
                <p className="text-gray-500 mb-6">The commissioner hasn&apos;t set up the draft yet.</p>

                {isCommissioner && teams && teams.length >= 2 ? (
                    <InitializeDraftButton leagueId={leagueId} />
                ) : isCommissioner ? (
                    <div className="text-red-500 font-bold uppercase text-sm mt-4">
                        Waiting for more teams to join (Need 2+)
                    </div>
                ) : null}
            </div>
        );
    }

    // Determine rounds
    const maxRound = Math.max(...picks.map((p: any) => p.round));
    const rounds = Array.from({ length: maxRound }, (_, i) => i + 1);

    return (
        <div className="overflow-x-auto pb-12">
            <div className="inline-block min-w-full align-middle">
                {isCommissioner && (
                    <div className="mb-4 flex justify-end items-center space-x-4">
                        {teams.length < 2 && (
                            <span className="text-xs text-red-500 font-bold uppercase">
                                Need {2 - teams.length} more team{2 - teams.length > 1 ? 's' : ''} to draft
                            </span>
                        )}
                        {teams.length >= 2 && (
                            <InitializeDraftButton leagueId={leagueId} label="Regenerate Draft Order" />
                        )}
                    </div>
                )}
                <div className="border border-neutral-800 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-800">
                        <thead>
                            <tr className="bg-neutral-950">
                                <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-12 sticky left-0 bg-neutral-950 z-10">
                                    Rn
                                </th>
                                {teams.map((team: any, i: number) => (
                                    <th key={team.id} className="px-3 py-3 text-center text-xs font-bold text-white uppercase tracking-wider w-48 truncate">
                                        {i + 1}. {team.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-neutral-900 divide-y divide-neutral-800">
                            {rounds.map((round) => (
                                <tr key={round} className="group hover:bg-neutral-800/20">
                                    <td className="px-3 py-4 text-center text-sm font-bold text-gray-500 sticky left-0 bg-neutral-900 group-hover:bg-neutral-800/20 z-10 border-r border-neutral-800">
                                        {round}
                                    </td>
                                    {teams.map((team: any) => {
                                        // Find pick for this round & team
                                        // NOTE: In a Snake draft, pick assignment logic is complex (order reverses).
                                        // For this MVP grid, we rely on the `team_id` stored in `fantasy_draft_picks`.
                                        // We just look for the pick that belongs to this team in this round.
                                        const pick = picks.find((p: any) => p.team_id === team.id && p.round === round);

                                        return (
                                            <td key={`${team.id}-${round}`} className="px-2 py-2 border-r border-neutral-800/50 last:border-r-0 h-24 align-top">
                                                {pick && pick.player ? (
                                                    <div className="bg-neutral-950 p-2 rounded border border-neutral-800 h-full flex flex-col justify-between">
                                                        <div className="text-xs font-bold text-white truncate" title={pick.player.name}>
                                                            {pick.player.name}
                                                        </div>
                                                        <div className="flex justify-between items-end mt-1">
                                                            <span className="text-[10px] text-gray-500 font-mono">{pick.player.position}</span>
                                                            {pick.player.ufl_team && (
                                                                <span
                                                                    className="text-[10px] uppercase font-bold"
                                                                    style={{ color: pick.player.ufl_team.primary_color }}
                                                                >
                                                                    {pick.player.ufl_team.slug.replace('bham-', '').substring(0, 3)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-neutral-800 text-xs font-mono">
                                                        •
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
