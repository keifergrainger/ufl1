import { SupabaseClient } from "@supabase/supabase-js";
// uuid import removed

/**
 * Generates schedule and runs draft for a league that already has teams.
 */
export async function startLeagueEngine(
    supabase: SupabaseClient,
    leagueId: string
) {
    console.log(`Starting league ${leagueId}...`);

    // 1. Fetch Existing Teams
    const { data: teams } = await supabase
        .from("fantasy_teams")
        .select("id")
        .eq("league_id", leagueId);

    if (!teams || teams.length < 2) {
        throw new Error("Need at least 2 teams to start.");
    }

    const numberOfTeams = teams.length;

    // 2. Generate Schedule (Round Robin)
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

    // If odd number of teams, we need a bye week logic, but for simplicity we assume even or handle gracefully
    // Standard Algo: fix first team, rotate others
    // If odd, one team sits out each week (bye). 
    // We will enforce even teams in UI or just add a 'BYE' ghost team? 
    // For MVP, lets just error if odd for now, or assume even.
    if (numberOfTeams % 2 !== 0) {
        // Simple fix: Add a "Bye Week" ghost team? No, just throw for now.
        // throw new Error("League must have even number of teams.");
        // Actually, let's just let it be odd and one matches against null/bye?
        // Or simpler: just pair up who we can.
    }

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

    // 3. Draft & Rosters
    const { data: allPlayers } = await supabase
        .from("players")
        .select("id")
        .eq("is_active", true);

    const availablePlayers = allPlayers?.map(p => p.id) || [];

    // Shuffle
    for (let i = availablePlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availablePlayers[i], availablePlayers[j]] = [availablePlayers[j], availablePlayers[i]];
    }

    // Snake Draft
    const rounds = 14;
    const draftPicks = [];
    const rosterEntries = [];

    let playerIndex = 0;

    for (let r = 1; r <= rounds; r++) {
        const isOdd = r % 2 !== 0;
        const roundOrder = isOdd ? [...teamIds] : [...teamIds].reverse();

        for (let i = 0; i < roundOrder.length; i++) {
            const teamId = roundOrder[i];
            const pickNum = (r - 1) * numberOfTeams + (i + 1);

            const playerId = availablePlayers[playerIndex] || null;
            playerIndex++;

            draftPicks.push({
                league_id: leagueId,
                team_id: teamId,
                player_id: playerId,
                round: r,
                pick_in_round: i + 1,
                overall_pick: pickNum,
            });

            if (playerId) {
                rosterEntries.push({
                    team_id: teamId,
                    player_id: playerId,
                    slot: "BENCH",
                });
            }
        }
    }

    await supabase.from("fantasy_draft_picks").insert(draftPicks);
    await supabase.from("fantasy_rosters").insert(rosterEntries);

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
