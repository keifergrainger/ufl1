'use server';

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { generateJoinCode } from "@/lib/fantasy/engine";

const ADMIN_EMAIL = "admin@stallions.ufl";

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
        throw new Error("Unauthorized: Admin access only.");
    }
    return supabase;
}

export async function archiveLeague(leagueId: string) {
    const supabase = await verifyAdmin();

    // Soft delete by setting status AND renaming code to free it up
    const timestamp = Math.floor(Date.now() / 1000);
    // Fetch current code first to append
    const { data: league } = await supabase.from('fantasy_leagues').select('league_code').eq('id', leagueId).single();

    if (league) {
        const newCode = `${league.league_code}_ARCHIVED_${timestamp}`;
        const { error } = await supabase
            .from('fantasy_leagues')
            .update({
                status: 'archived',
                league_code: newCode
            })
            .eq('id', leagueId);

        if (error) throw new Error(`Failed to archive league: ${error.message}`);
    }
    revalidatePath('/admin/fantasy');
}

export async function deleteLeague(leagueId: string) {
    const supabase = await verifyAdmin();

    // Hard delete - Cascade should handle relations if configured, 
    // otherwise we might need to delete related rows first.
    // Based on schema `on delete cascade` is present for most foreign keys.
    const { error } = await supabase
        .from('fantasy_leagues')
        .delete()
        .eq('id', leagueId);

    if (error) throw new Error(`Failed to delete league: ${error.message}`);
    revalidatePath('/admin/fantasy');
}

export async function updateLeague(
    leagueId: string,
    data: { name?: string; season_year?: number; status?: 'active' | 'archived'; commissioner_id?: string }
) {
    const supabase = await verifyAdmin();

    // 1. Update basics
    const { error: leagueError } = await supabase
        .from('fantasy_leagues')
        .update({
            name: data.name,
            season_year: data.season_year,
            status: data.status
        })
        .eq('id', leagueId);

    if (leagueError) throw new Error(`Failed to update league: ${leagueError.message}`);

    // 2. Update commissioner if changed
    if (data.commissioner_id) {
        // Demote old commissioner (optional? usually only one commish)
        // Strictly speaking, we should find the old one and set to member, then set new one to commish.
        // For now, let's just set the new user's role to commissioner.

        // This assumes the new commissioner is ALREADY a member.
        // If not, we'd need to insert them.

        // Check if member
        const { data: member } = await supabase
            .from('fantasy_league_members')
            .select('role')
            .eq('league_id', leagueId)
            .eq('user_id', data.commissioner_id)
            .single();

        if (member) {
            await supabase
                .from('fantasy_league_members')
                .update({ role: 'commissioner' })
                .eq('league_id', leagueId)
                .eq('user_id', data.commissioner_id);

            // Also update created_by for RLS consistency if strictly relying on that
            await supabase
                .from('fantasy_leagues')
                .update({ created_by: data.commissioner_id })
                .eq('id', leagueId);
        } else {
            // Handle case where admin assigns a non-member (maybe via email lookup? too complex for MVP edit)
            // We'll assume the UI sends a valid existing member ID.
        }
    }

    revalidatePath('/admin/fantasy');
}

export async function regenerateInviteCode(leagueId: string) {
    const supabase = await verifyAdmin();
    const newCode = generateJoinCode();

    const { error } = await supabase
        .from('fantasy_leagues')
        .update({ league_code: newCode })
        .eq('id', leagueId);

    if (error) throw new Error(`Failed to regenerate code: ${error.message}`);
    revalidatePath('/admin/fantasy');
}
