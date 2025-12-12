'use server';

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { startLeagueEngine } from "@/lib/fantasy/engine";

export async function initializeDraft(leagueId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Commissioner
    const { data: member } = await supabase
        .from("fantasy_league_members")
        .select("role")
        .eq("league_id", leagueId)
        .eq("user_id", user.id)
        .single();

    if (member?.role !== 'commissioner') {
        throw new Error("Must be commissioner to initialize draft.");
    }

    // Run Engine (Generates picks, sets status)
    try {
        await startLeagueEngine(supabase, leagueId);
    } catch (e: any) {
        throw new Error(e.message);
    }

    revalidatePath(`/fantasy/leagues/${leagueId}`);
    return { success: true };
}

export async function makeDraftPick(params: {
    leagueId: string;
    playerId: string;
}) {
    const supabase = await createClient();
    const { leagueId, playerId } = params;

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Must be logged in to draft." };
    }

    // 2. Load League & Draft State
    const { data: league, error: leagueError } = await supabase
        .from('fantasy_leagues')
        .select('draft_type, draft_status, current_pick_overall, created_by')
        .eq('id', leagueId)
        .single();

    if (leagueError || !league) {
        return { error: "League not found." };
    }

    if (league.draft_type !== 'live') {
        return { error: "This league is not in live draft mode." };
    }

    if (league.draft_status !== 'in_progress') {
        return { error: "Draft is not currently in progress." };
    }

    // 3. Load Current Pick
    const { data: currentPick, error: pickError } = await supabase
        .from('fantasy_draft_picks')
        .select('id, team_id, overall_pick, player_id, fantasy_team:fantasy_teams(user_id, name)')
        .eq('league_id', leagueId)
        .eq('overall_pick', league.current_pick_overall)
        .single();

    if (pickError || !currentPick) {
        return { error: "Could not find current draft pick slot." };
    }

    if (currentPick.player_id) {
        return { error: "This pick has already been made." };
    }

    // 4. Permission Check: Is it this user's turn?
    const isCommissioner = league.created_by === user.id;
    // Note: fantasy_team might be returned as an array by Supabase JS client depending on types
    const teamData = Array.isArray(currentPick.fantasy_team) ? currentPick.fantasy_team[0] : currentPick.fantasy_team;
    const teamOwnerId = teamData?.user_id;

    if (teamOwnerId !== user.id && !isCommissioner) {
        return { error: "It is not your turn to pick." };
    }

    // 5. Player Availability Check
    // Reuse specific check: check if player is already picked in this league
    const { data: existing } = await supabase
        .from('fantasy_draft_picks')
        .select('id')
        .eq('league_id', leagueId)
        .eq('player_id', playerId)
        .single();

    if (existing) {
        return { error: "This player has already been drafted." };
    }

    // 6. Execute Pick (Transaction-like steps)
    // Supabase doesn't expose easy transactions via JS client yet, so we verify step-by-step or trust optimistic
    // We update pick first to lock it.

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
        .from('fantasy_draft_picks')
        .update({
            player_id: playerId,
            picked_at: now
        })
        .eq('id', currentPick.id)
        .is('player_id', null); // Optimistic lock ensuring it wasn't stolen mid-flight

    if (updateError) { // Likely race condition if row checks failed
        return { error: "Failed to process pick. It might have been taken." };
    }

    // 7. Add to Roster
    const { error: rosterError } = await supabase
        .from('fantasy_rosters')
        .insert({
            team_id: currentPick.team_id,
            player_id: playerId,
            slot: 'BENCH' // Default everything to Bench, user organizes later
        });

    if (rosterError) {
        // Critical Error: Pick made but roster failed. 
        // In a real app we'd rollback. Here we log.
        console.error("CRITICAL: Pick made but roster insert failed", rosterError);
    }

    // 8. Advance Draft
    const nextPickNum = league.current_pick_overall + 1;

    // Check if that was the last pick
    const { count: totalPicks } = await supabase
        .from('fantasy_draft_picks')
        .select('*', { count: 'exact', head: true })
        .eq('league_id', leagueId);

    if (totalPicks && nextPickNum > totalPicks) {
        await supabase
            .from('fantasy_leagues')
            .update({
                draft_status: 'complete',
                current_pick_overall: nextPickNum
            })
            .eq('id', leagueId);
    } else {
        await supabase
            .from('fantasy_leagues')
            .update({ current_pick_overall: nextPickNum })
            .eq('id', leagueId);
    }

    revalidatePath(`/fantasy/leagues/${leagueId}/draft`);
    return { success: true };
}

export async function autoCompleteDraft(leagueId: string) {
    const supabase = await createClient();

    // Auth & Permission Checks
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: league } = await supabase.from('fantasy_leagues').select('created_by, draft_status').eq('id', leagueId).single();
    if (!league || league.created_by !== user.id) return { error: "Only commissioner can auto-complete." };
    if (league.draft_status === 'complete') return { error: "Draft already complete." };

    // Get all remaining picks
    const { data: remainingPicks } = await supabase
        .from('fantasy_draft_picks')
        .select('*')
        .eq('league_id', leagueId)
        .is('player_id', null)
        .order('overall_pick', { ascending: true });

    if (!remainingPicks || remainingPicks.length === 0) return { success: true };

    // Get available players
    // Expensive query: Get all active players, filter out taken ones.
    const { data: taken } = await supabase.from('fantasy_draft_picks').select('player_id').eq('league_id', leagueId).not('player_id', 'is', null);
    const takenIds = new Set(taken?.map(p => p.player_id));

    const { data: allPlayers } = await supabase.from('players').select('id').eq('is_active', true);

    if (!allPlayers) return { error: "No players found." };

    let available = allPlayers.filter(p => !takenIds.has(p.id));

    // Shuffle available
    for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
    }

    // Assign
    const updates = [];
    const rosterInserts = [];
    let playerIdx = 0;

    for (const pick of remainingPicks) {
        if (playerIdx >= available.length) break; // Running out of players
        const pid = available[playerIdx].id;

        updates.push({
            id: pick.id,
            player_id: pid,
            picked_at: new Date().toISOString()
        });

        rosterInserts.push({
            team_id: pick.team_id,
            player_id: pid,
            slot: 'BENCH'
        });

        playerIdx++;
    }

    // Batch Upsert
    // Note: Supabase upsert works if PK is present.
    // For picks, we update. Roster is insert.
    if (updates.length > 0) {
        // We have to loop updates unfortunately or write a raw query, 
        // OR upsert if we include all columns. 
        // For safety/speed in this context, loop is okay for < 100 picks, or recursive calls.

        // Actually best way:
        await supabase.from('fantasy_draft_picks').upsert(updates);
        await supabase.from('fantasy_rosters').insert(rosterInserts);
    }

    // Complete
    await supabase.from('fantasy_leagues').update({
        draft_status: 'complete',
        current_pick_overall: (remainingPicks[remainingPicks.length - 1].overall_pick || 0) + 1
    }).eq('id', leagueId);

    revalidatePath(`/fantasy/leagues/${leagueId}/draft`);
    return { success: true };
}
