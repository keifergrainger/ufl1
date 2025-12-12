import { SupabaseClient } from "@supabase/supabase-js";
// uuid import removed

/**
 * Generates schedule and runs draft for a league that already has teams.
 */
/**
 * Generates schedule and runs draft for a league that already has teams.
 */
export async function startLeagueEngine(
    supabase: SupabaseClient,
    leagueId: string
) {
    console.log(`Starting league ${leagueId}...`);

    // 1. Fetch Existing League Settings
    const { data: league } = await supabase
        .from("fantasy_leagues")
        .select("draft_type")
        .eq("id", leagueId)
        .single();

    // Default to auto if not set (legacy support), but new leagues should be 'live'
    const draftType = league?.draft_type || 'auto';

    // 2. Fetch Existing Teams
    const { data: teams } = await supabase
        .from("fantasy_teams")
        .select("id")
        .eq("league_id", leagueId);

    if (!teams || teams.length < 2) {
        throw new Error("Need at least 2 teams to start.");
    }

    const numberOfTeams = teams.length;

    // 3. Generate Schedule (Round Robin)
    // Only generate if no weeks exist (idempotency check)
    const { count: weekCount } = await supabase
        .from("fantasy_weeks")
        .select("*", { count: "exact", head: true })
        .eq("league_id", leagueId);

    // This check allows re-running "Start League" to just init draft if schedule exists
    if (weekCount === 0) {
        const weeksToGenerate = 10;
        const weekIds = [];

        // Create Week entries
        for (let w = 1; w <= weeksToGenerate; w++) {
            const { data: week, error: weekError } = await supabase
                .from("fantasy_weeks")
                .insert({
                    league_id: leagueId,
                    week_number: w,
                    label: `Week ${w}`,
                })
                .select()
                .single();

            if (weekError) throw weekError;
            weekIds.push(week.id);
        }

        // Round Robin Logic
        const teamIds = teams.map((t) => t.id);
        const matchups = [];

        let rotatedTeams = [...teamIds];

        for (let w = 0; w < weeksToGenerate; w++) {
            const weekId = weekIds[w];

            const half = Math.floor(rotatedTeams.length / 2);
            for (let i = 0; i < half; i++) {
                matchups.push({
                    league_id: leagueId,
                    week_id: weekId,
                    home_team_id: rotatedTeams[i],
                    away_team_id: rotatedTeams[rotatedTeams.length - 1 - i],
                    home_score: 0,
                    away_score: 0,
                });
            }

            // Rotate
            const first = rotatedTeams[0];
            const rest = rotatedTeams.slice(1);
            const last = rest.pop();
            if (last) rest.unshift(last);
            rotatedTeams = [first, ...rest];
        }

        const { error: matchError } = await supabase
            .from("fantasy_matchups")
            .insert(matchups);

        if (matchError) throw matchError;
    }

    // 4. Draft Initialization

    // Check if picks already exist
    const { count: pickCount } = await supabase.from('fantasy_draft_picks').select('*', { count: 'exact', head: true }).eq('league_id', leagueId);

    if (pickCount && pickCount > 0) {
        // Picks exist. If 'live', we just ensure status is in_progress
        if (draftType === 'live') {
            await supabase.from('fantasy_leagues').update({ draft_status: 'in_progress', current_pick_overall: 1 }).eq('id', leagueId);
            return { success: true };
        }
        // If auto, we assume it's done.
        return { success: true };
    }

    // Get Active Players
    const { data: allPlayers } = await supabase
        .from("players")
        .select("id")
        .eq("is_active", true);

    const availablePlayers = allPlayers?.map(p => p.id) || [];

    // Shuffle Players (Only needed for auto-draft, but good to have random pool order anyway)
    for (let i = availablePlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availablePlayers[i], availablePlayers[j]] = [availablePlayers[j], availablePlayers[i]];
    }

    // Shuffle Teams determines Draft Order
    const teamIds = teams.map((t) => t.id);
    for (let i = teamIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [teamIds[i], teamIds[j]] = [teamIds[j], teamIds[i]];
    }

    // Snake Draft Setup
    const rounds = 14;
    const draftPicks = [];
    const rosterEntries = []; // Only for auto
    let playerIndex = 0;

    for (let r = 1; r <= rounds; r++) {
        const isOdd = r % 2 !== 0; // 1, 3, 5... Normal Order
        // Snake: odd rounds normal, even rounds reversed
        const roundOrder = isOdd ? [...teamIds] : [...teamIds].reverse();

        for (let i = 0; i < roundOrder.length; i++) {
            const teamId = roundOrder[i];
            const pickNum = (r - 1) * numberOfTeams + (i + 1);

            if (draftType === 'auto') {
                // Auto Draft: Assign Player Immediately
                const playerId = availablePlayers[playerIndex] || null;
                playerIndex++;

                draftPicks.push({
                    league_id: leagueId,
                    team_id: teamId,
                    player_id: playerId,
                    round: r,
                    pick_in_round: i + 1,
                    overall_pick: pickNum,
                    picked_at: new Date().toISOString()
                });

                if (playerId) {
                    rosterEntries.push({
                        team_id: teamId,
                        player_id: playerId,
                        slot: "BENCH",
                    });
                }
            } else {
                // Live Draft: Empty Pick
                draftPicks.push({
                    league_id: leagueId,
                    team_id: teamId,
                    player_id: null, // Empty
                    round: r,
                    pick_in_round: i + 1,
                    overall_pick: pickNum,
                    picked_at: null
                });
            }
        }
    }

    // Insert Picks
    await supabase.from("fantasy_draft_picks").insert(draftPicks);

    if (draftType === 'auto') {
        // Insert Rosters immediately
        await supabase.from("fantasy_rosters").insert(rosterEntries);
        // Mark Complete
        await supabase.from("fantasy_leagues").update({ draft_status: 'complete' }).eq('id', leagueId);
    } else {
        // Live Draft: Set In Progress
        await supabase.from("fantasy_leagues").update({ draft_status: 'in_progress', current_pick_overall: 1 }).eq('id', leagueId);
    }

    return { success: true };
}

export function generateJoinCode() {
    // Generate a random 6-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, 1, O, 0 similar looking chars
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
