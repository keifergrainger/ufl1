'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function initializeDraft(leagueId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    // 1. Verify Commissioner Status
    const { data: member } = await supabase
        .from('fantasy_league_members')
        .select('role')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .single();

    if (!member || member.role !== 'commissioner') {
        throw new Error('Only the commissioner can initialize the draft.');
    }

    // 2. Clear existing picks (idempotency/reset)
    // Note: In strict apps, we might block this if draft has started. 
    // For MVP, allow reset.
    await supabase.from('fantasy_draft_picks').delete().eq('league_id', leagueId);

    // 3. Get Teams
    const { data: teams } = await supabase
        .from('fantasy_teams')
        .select('id')
        .eq('league_id', leagueId)
        .order('created_at', { ascending: true }); // Simplest "random" order for now

    if (!teams || teams.length < 2) {
        throw new Error('Cannot start draft: You need at least 2 teams in the league.');
    }

    // 4. Generate Picks (Fixed 15 rounds for MVP)
    const ROUNDS = 15;
    const picksToInsert = [];
    let overallPick = 1;

    for (let round = 1; round <= ROUNDS; round++) {
        // Snake Draft Logic: Odd rounds (1, 3...) normal, Even rounds (2, 4...) reverse
        const roundTeams = round % 2 === 1 ? [...teams] : [...teams].reverse();

        for (let i = 0; i < roundTeams.length; i++) {
            picksToInsert.push({
                league_id: leagueId,
                round: round,
                pick_in_round: i + 1,
                overall_pick: overallPick,
                team_id: roundTeams[i].id,
                player_id: null // Empty slot
            });
            overallPick++;
        }
    }

    const { error } = await supabase.from('fantasy_draft_picks').insert(picksToInsert);

    if (error) {
        throw new Error('Failed to generate picks: ' + error.message);
    }

    revalidatePath(`/fantasy/leagues/${leagueId}/draft`);
    return { success: true };
}
