import InitializeDraftButton from './InitializeDraftButton';
import { createClient } from '@/lib/supabase-server';
import PlayerSelector from './PlayerSelector';
import { autoCompleteDraft } from './actions';
import { revalidatePath } from 'next/cache';

export default async function DraftPage({ params }: { params: Promise<{ leagueId: string }> }) {
    const supabase = await createClient();
    const { leagueId } = await params;

    // 1. Fetch League & User
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch League details for Status/Type
    const { data: league } = await supabase.from('fantasy_leagues').select('*').eq('id', leagueId).single();

    if (!league) return <div>League not found</div>;

    // 2. Fetch Teams
    const { data: teams } = await supabase
        .from('fantasy_teams')
        .select('id, name, user_id')
        .eq('league_id', leagueId)
        .order('name', { ascending: true }); // Ideally draft order, but name for stable columns

    if (!teams || teams.length === 0) {
        return <div className="p-12 text-center text-gray-500">No teams in this league.</div>;
    }

    // 3. Fetch Picks
    const { data: picks } = await supabase
        .from('fantasy_draft_picks')
        .select(`
          *,
          player:players(name, position, ufl_team:ufl_teams(slug, primary_color))
        `)
        .eq('league_id', leagueId)
        .order('overall_pick', { ascending: true });

    // 4. Determine User Role
    let isCommissioner = false;
    let myTeamIds: string[] = [];

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

        myTeamIds = teams.filter((t: any) => t.user_id === user.id).map((t: any) => t.id);
    }

    // 5. Draft State Logic
    const isLive = league.draft_type === 'live';
    const isPending = league.draft_status === 'pending';
    const isComplete = league.draft_status === 'complete';
    const isInProgress = league.draft_status === 'in_progress';

    // Current Pick Info
    let currentPick = null;
    let onClockTeam = null;
    let isOnClock = false;

    if (isInProgress && picks) {
        currentPick = picks.find((p: any) => p.overall_pick === league.current_pick_overall);
        if (currentPick) {
            onClockTeam = teams.find((t: any) => t.id === currentPick.team_id);
            if (onClockTeam) {
                // User is on clock if they own the team OR they are commissioner (can draft for anyone/CPU)
                if (myTeamIds.includes(onClockTeam.id) || (isCommissioner && !onClockTeam.user_id)) {
                    isOnClock = true;
                }
                // allow commissioner to override ANY pick if needed for manual fixes? 
                // Creating a simplified "Pick for them" could be added, but for now strict ownership or CPU.
                // Let's allow Commissioner to draft for ANYONE as a failsafe
                if (isCommissioner) isOnClock = true;
            }
        }
    }

    // 6. Player Pool (Expensive, optimize later? or fetch only needed fields)
    // We need list of players + Taken status
    // For MVP, we can fetch all Active players (~400 rows) which is fine for Server Component
    let playerPool = [];
    if (isLive && !isComplete) {
        const { data: allPlayers } = await supabase
            .from('players')
            .select('id, name, position, ufl_team:ufl_teams(slug, primary_color)')
            .eq('is_active', true)
            .order('name');

        if (allPlayers) {
            // Mark Taken
            const takenIds = new Set(picks?.filter((p: any) => p.player_id).map((p: any) => p.player_id));
            playerPool = allPlayers.map((p: any) => ({
                ...p,
                taken: takenIds.has(p.id)
            }));
        }
    }

    // Server Action Wrapped for Button
    async function handlAutoComplete() {
        'use server';
        await autoCompleteDraft(leagueId);
    }

    // Rounds Layout
    const maxRound = picks && picks.length > 0 ? Math.max(...picks.map((p: any) => p.round)) : 14;
    const rounds = Array.from({ length: maxRound }, (_, i) => i + 1);

    if (isPending && (!picks || picks.length === 0)) {
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

    return (
        <div className="space-y-6">
            {/* Status Bar */}
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black italic uppercase text-white">
                        {isLive ? 'Live Draft Room' : 'Draft Results'}
                    </h2>
                    <div className="text-gray-400 text-sm">
                        {isPending && "Draft is pending start."}
                        {isComplete && "Draft is complete."}
                        {isInProgress && (
                            <span className="text-green-400 font-bold animate-pulse">
                                IN PROGRESS &bull; Round {currentPick?.round} &bull; Pick {currentPick?.pick_in_round}
                            </span>
                        )}
                    </div>
                </div>

                {isInProgress && onClockTeam && (
                    <div className="bg-neutral-950 px-6 py-3 rounded-lg border border-blue-900/50 flex flex-col items-center">
                        <span className="text-[10px] uppercase text-blue-400 font-bold tracking-widest mb-1">On The Clock</span>
                        <span className="text-xl font-bold text-white">{onClockTeam.name}</span>
                        {isOnClock && <span className="text-xs text-green-500 font-bold mt-1">It&apos;s you!</span>}
                    </div>
                )}

                {/* Commissioner Controls */}
                {isCommissioner && (
                    <div className="flex gap-2">
                        {isPending && teams.length >= 2 && (
                            <InitializeDraftButton leagueId={leagueId} label="Regenerate Order" />
                        )}
                        {isInProgress && (
                            <form action={handlAutoComplete}>
                                <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-xs font-bold uppercase transition-colors">
                                    Auto-Complete Remaining
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[600px] overflow-hidden">
                {/* Draft Board (Main) */}
                <div className="flex-1 overflow-hidden flex flex-col bg-neutral-900/40 rounded-xl border border-neutral-800">
                    <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                        <div className="inline-block min-w-full align-top">
                            <table className="min-w-full divide-y divide-neutral-800 border-separate border-spacing-0">
                                <thead className="bg-neutral-950 sticky top-0 z-30">
                                    <tr>
                                        <th className="px-1 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-10 sticky left-0 bg-neutral-950 z-40 border-r border-neutral-800 border-b shadow-sm">Rn</th>
                                        {teams.map((team: any, i: number) => (
                                            <th key={team.id} className="px-2 py-3 text-center text-[10px] font-bold text-white uppercase tracking-wider min-w-[140px] truncate border-r border-neutral-800/50 last:border-r-0 border-b border-neutral-800">
                                                {i + 1}. {team.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-neutral-900 divide-y divide-neutral-800 bg-opacity-50">
                                    {rounds.map((round) => (
                                        <tr key={round} className="group hover:bg-neutral-800/30 transition-colors">
                                            <td className="px-1 py-1 text-center text-xs font-bold text-gray-500 sticky left-0 bg-neutral-900 group-hover:bg-neutral-900 z-20 border-r border-neutral-800 border-b-0">
                                                {round}
                                            </td>
                                            {teams.map((team: any) => {
                                                const pick = picks?.find((p: any) => p.team_id === team.id && p.round === round);
                                                const isActive = pick?.overall_pick === league.current_pick_overall && isInProgress;

                                                return (
                                                    <td key={`${team.id}-${round}`} className={`px-1 py-1 border-r border-neutral-800/50 last:border-r-0 h-16 align-top transition-colors ${isActive ? 'bg-blue-900/20 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]' : ''}`}>
                                                        {pick && pick.player ? (
                                                            <div className="bg-neutral-950 p-1.5 rounded border border-neutral-800 h-full flex flex-col justify-between hover:border-neutral-600 transition-colors group/card">
                                                                <div className="text-[10px] font-bold text-white truncate leading-tight group-hover/card:text-blue-200 transition-colors" title={pick.player.name}>
                                                                    {pick.player.name}
                                                                </div>
                                                                <div className="flex justify-between items-end mt-0.5">
                                                                    <span className="text-[9px] text-gray-500 font-mono">{pick.player.position}</span>
                                                                    {pick.player.ufl_team && (
                                                                        <span className="text-[8px] uppercase font-bold" style={{ color: pick.player.ufl_team.primary_color }}>
                                                                            {pick.player.ufl_team.slug.replace(/(bham-|hou-|mem-|mich-|arl-|dc-|sa-|stl-)/, '').substring(0, 3)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className={`h-full flex flex-col items-center justify-center text-neutral-800 text-[10px] font-mono rounded ${isActive ? 'bg-blue-500/10' : ''}`}>
                                                                {isActive ? (
                                                                    <span className="text-blue-400 animate-pulse font-bold text-[9px] tracking-tighter">ON CLOCK</span>
                                                                ) : (
                                                                    <span className="opacity-10">&bull;</span>
                                                                )}
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

                {/* Player Selector (Sidebar) */}
                {isInProgress && (
                    <div className="lg:w-[320px] xl:w-[380px] flex-none z-30">
                        <div className="h-full">
                            <PlayerSelector
                                leagueId={leagueId}
                                players={playerPool}
                                isOnClock={isOnClock}
                                currentTeamName={onClockTeam?.name}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
