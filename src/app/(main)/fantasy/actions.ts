'use server';

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateJoinCode, startLeagueEngine } from "@/lib/fantasy/engine";

export async function createLeague(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Must be logged in to create a league");
    }

    const name = formData.get("name") as string;
    const teamName = formData.get("teamName") as string;
    const teamsCount = parseInt(formData.get("teams") as string);
    // Determine season: If after September (Index 8), assume prepping for next Spring season
    const now = new Date();
    const season = now.getMonth() > 8 ? now.getFullYear() + 1 : now.getFullYear();

    const isPublic = formData.get("visibility") === "public";

    // Custom Code Logic
    let code = formData.get("customCode") as string;

    if (code && code.trim().length > 0) {
        // User provided a code
        code = code.toUpperCase().trim();
        if (code.length !== 6) {
            throw new Error("Custom code must be exactly 6 characters.");
        }
        // Check availability
        const { data: existing } = await supabase.from('fantasy_leagues').select('id').eq('league_code', code).single();
        if (existing) {
            throw new Error("This Join Code is already taken. Please choose another.");
        }
    } else {
        // Auto-generate
        code = generateJoinCode();
    }

    // Defaults for simplified UI
    const draftType = 'auto';
    const scoringPreset = 'default';
    const description = '';

    if (!name || !teamsCount || !teamName) {
        throw new Error("Missing required fields");
    }

    // 1. Create League
    const { data: league, error: leagueError } = await supabase
        .from("fantasy_leagues")
        .insert({
            name,
            season_year: season,
            created_by: user.id,
            league_code: code,
            max_teams: teamsCount,
            auto_generated: false,
            is_public: isPublic,
            description,
            draft_type: draftType,
            scoring_preset: scoringPreset
        })
        .select()
        .single();

    if (leagueError) {
        console.error("League creation failed:", leagueError);
        throw new Error("Failed to create league");
    }

    // 2. Add Creator as Commissioner
    const { error: memberError } = await supabase
        .from("fantasy_league_members")
        .insert({
            league_id: league.id,
            user_id: user.id,
            role: "commissioner"
        });

    if (memberError) {
        console.error("Member creation failed:", memberError);
        throw new Error("Failed to join league as commissioner");
    }

    // 3. Create Commissioner's Team
    await supabase.from("fantasy_teams").insert({
        league_id: league.id,
        user_id: user.id,
        name: teamName,
        is_claimed: true
    });

    revalidatePath("/fantasy");
    redirect(`/fantasy/leagues/${league.id}`);
}

export async function joinLeague(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Must be logged in");

    const code = formData.get("code") as string;
    const teamName = formData.get("teamName") as string;

    if (!code || !teamName) return { error: "Missing fields" };

    // 1. Find League
    const { data: league } = await supabase
        .from("fantasy_leagues")
        .select("id, max_teams, fantasy_teams(id)")
        .eq("league_code", code)
        .single();

    if (!league) {
        return { error: "Invalid league code" };
    }

    // 2. Check Capacity
    const currentTeams = league.fantasy_teams?.length || 0;
    if (currentTeams >= league.max_teams) {
        return { error: "League is full" };
    }

    // 3. Check if already a member
    const { data: member } = await supabase
        .from("fantasy_league_members")
        .select("id")
        .eq("league_id", league.id)
        .eq("user_id", user.id)
        .single();

    if (member) {
        return { success: true, leagueId: league.id };
    }

    // 4. Join: Create Member + Create Team
    const { error: joinError } = await supabase
        .from("fantasy_league_members")
        .insert({
            league_id: league.id,
            user_id: user.id,
            role: "member"
        });

    if (joinError) return { error: "Failed to join league" };

    const { error: teamError } = await supabase
        .from("fantasy_teams")
        .insert({
            league_id: league.id,
            user_id: user.id,
            name: teamName,
            is_claimed: true
        });

    if (teamError) {
        console.error("Team creation failed", teamError);
    }

    revalidatePath(`/fantasy/leagues/${league.id}`);
    redirect(`/fantasy/leagues/${league.id}`); // Redirect from server action
}

// Commissioner Tools
export async function startLeague(leagueId: string) {
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
        throw new Error("Must be commissioner");
    }

    // Run Engine
    try {
        await startLeagueEngine(supabase, leagueId);
    } catch (e: any) {
        return { error: e.message };
    }

    revalidatePath(`/fantasy/leagues/${leagueId}`);
    return { success: true };
}

export async function regenerateDraft(leagueId: string) {
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
        throw new Error("Must be commissioner");
    }

    // Dangerous: Reset Picks and Rosters
    await supabase.from("fantasy_draft_picks").delete().eq("league_id", leagueId);
    await supabase.from("fantasy_rosters").delete().match({
        // We can't easily delete by league_id since rosters are linked to teams
        // But we can delete rosters where team_id in (teams of league)
    });

    // Easier way: Get all teams
    const { data: teams } = await supabase.from("fantasy_teams").select("id").eq("league_id", leagueId);
    if (!teams) return;
    const teamIds = teams.map(t => t.id);

    await supabase.from("fantasy_rosters").delete().in("team_id", teamIds);
    await supabase.from("fantasy_draft_picks").delete().eq("league_id", leagueId);

    // Re-run Engine Draft Logic
    // We can reuse initializeLeague but it does team creation. 
    // Let's call the specific draft part if we extracted it, or just copy logic for now
    // For MVP speed, I'll just re-call the whole init but skip team creation if existing?
    // Actually, initializeLeague tries to create teams.
    // Let's make a helper in engine.ts for just drafting.

    // For now, I'll just redirect since I need to refactor engine to split it properly
    // or assume the user wants full reset.
}

export async function resetLeague(leagueId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Commissioner
    const { data: member } = await supabase.from("fantasy_league_members").select("role").eq("league_id", leagueId).eq("user_id", user.id).single();
    if (member?.role !== 'commissioner') throw new Error("Unauthorized");

    // Nuke everything but keep teams/members?
    // "Dangerous Reset" implies hard reset.
    // If we want to allow re-drafting, we should just clear schedule/drafts/rosters but keep teams.

    await supabase.from("fantasy_matchups").delete().eq("league_id", leagueId);
    await supabase.from("fantasy_draft_picks").delete().eq("league_id", leagueId);

    const { data: teams } = await supabase.from("fantasy_teams").select("id").eq("league_id", leagueId);
    if (teams && teams.length > 0) {
        await supabase.from("fantasy_rosters").delete().in("team_id", teams.map(t => t.id));
    }

    await supabase.from("fantasy_weeks").delete().eq("league_id", leagueId);

    // Do NOT delete teams in this new dynamic mode, otherwise users lose their spots.
    // If they want to kick users, they should do that individually.

    revalidatePath(`/fantasy/leagues/${leagueId}`);
}

// -- NEW COMMISSIONER SETTINGS ACTIONS --

export async function updateLeagueDetails(leagueId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Commissioner
    const { data: member } = await supabase.from("fantasy_league_members").select("role").eq("league_id", leagueId).eq("user_id", user.id).single();
    if (member?.role !== 'commissioner') throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const visibility = formData.get("visibility") as string;
    const isPublic = visibility === 'public';

    if (!name) throw new Error("League Name is required");

    const { error } = await supabase
        .from('fantasy_leagues')
        .update({
            name,
            is_public: isPublic
        })
        .eq('id', leagueId);

    if (error) throw new Error(`Failed to update league: ${error.message}`);

    revalidatePath(`/fantasy/leagues/${leagueId}`);
    revalidatePath(`/fantasy/leagues/${leagueId}/settings`);
}

export async function regenerateLeagueCode(leagueId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Commissioner
    const { data: member } = await supabase.from("fantasy_league_members").select("role").eq("league_id", leagueId).eq("user_id", user.id).single();
    if (member?.role !== 'commissioner') throw new Error("Unauthorized");

    const newCode = generateJoinCode();

    const { error } = await supabase
        .from('fantasy_leagues')
        .update({ league_code: newCode })
        .eq('id', leagueId);

    if (error) throw new Error(`Failed to regenerate code: ${error.message}`);

    revalidatePath(`/fantasy/leagues/${leagueId}`);
    revalidatePath(`/fantasy/leagues/${leagueId}/settings`);
}

export async function updateMaxTeams(leagueId: string, maxTeams: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Commissioner
    const { data: member } = await supabase.from("fantasy_league_members").select("role").eq("league_id", leagueId).eq("user_id", user.id).single();
    if (member?.role !== 'commissioner') throw new Error("Unauthorized");

    // Validate: Cannot set max teams lower than current team count
    const { data: teams } = await supabase.from('fantasy_teams').select('id').eq('league_id', leagueId);
    const currentCount = teams?.length || 0;

    if (maxTeams < currentCount) {
        throw new Error(`Cannot set Max Teams lower than current team count (${currentCount}).`);
    }

    const { error } = await supabase
        .from('fantasy_leagues')
        .update({ max_teams: maxTeams })
        .eq('id', leagueId);

    if (error) throw new Error(`Failed to update max teams: ${error.message}`);

    revalidatePath(`/fantasy/leagues/${leagueId}/settings`);
}

export async function deleteTeam(leagueId: string, teamId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Commissioner
    const { data: member } = await supabase.from("fantasy_league_members").select("role").eq("league_id", leagueId).eq("user_id", user.id).single();
    if (member?.role !== 'commissioner') throw new Error("Unauthorized");

    // Get team owner to remove from league members
    const { data: team } = await supabase.from('fantasy_teams').select('user_id').eq('id', teamId).single();

    // Prevent deleting your own team/commissioner team to avoid lockout accidents (must use Delete League)
    if (team?.user_id === user.id) {
        throw new Error("Cannot kick yourself. Use 'Delete League' if you want to scrap everything.");
    }

    // Delete Team (Cascades to rosters if any, but valid only pre-season usually)
    const { error: deleteError } = await supabase
        .from('fantasy_teams')
        .delete()
        .eq('id', teamId);

    if (deleteError) throw new Error(`Failed to delete team: ${deleteError.message}`);

    // Remove user from league members if they had a user_id
    if (team?.user_id) {
        await supabase
            .from('fantasy_league_members')
            .delete()
            .eq('league_id', leagueId)
            .eq('user_id', team.user_id);
    }

    revalidatePath(`/fantasy/leagues/${leagueId}/settings`);
    revalidatePath(`/fantasy/leagues/${leagueId}`);
}

export async function archiveLeague(leagueId: string) {
    const supabase = await createClient();
    console.log("Archiving league:", leagueId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Commissioner
    const { data: member } = await supabase.from("fantasy_league_members").select("role").eq("league_id", leagueId).eq("user_id", user.id).single();
    if (member?.role !== 'commissioner') throw new Error("Unauthorized");

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

    revalidatePath('/fantasy');
    redirect('/fantasy');
}

export async function deleteLeague(leagueId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Commissioner
    const { data: member } = await supabase.from("fantasy_league_members").select("role").eq("league_id", leagueId).eq("user_id", user.id).single();
    if (member?.role !== 'commissioner') throw new Error("Unauthorized");

    const { error } = await supabase
        .from('fantasy_leagues')
        .delete()
        .eq('id', leagueId);

    if (error) throw new Error(`Failed to delete league: ${error.message}`);

    revalidatePath('/fantasy');
    redirect('/fantasy');
}

export async function addPlaceholderTeam(leagueId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify Commissioner
    const { data: member } = await supabase.from("fantasy_league_members").select("role").eq("league_id", leagueId).eq("user_id", user.id).single();
    if (member?.role !== 'commissioner') throw new Error("Unauthorized");

    // Check Capacity
    const { data: league } = await supabase.from('fantasy_leagues').select('max_teams').eq('id', leagueId).single();
    const { count } = await supabase.from('fantasy_teams').select('*', { count: 'exact', head: true }).eq('league_id', leagueId);

    if (league && count !== null && count >= league.max_teams) {
        throw new Error("League is full. Increase Max Teams to add more.");
    }

    // Generate Name
    // Get highest CPU number if any
    const { data: cpus } = await supabase.from('fantasy_teams').select('name').ilike('name', 'CPU Team %').order('name', { ascending: false }).limit(1);
    let botNumber = 1;
    if (cpus && cpus.length > 0) {
        const lastNum = parseInt(cpus[0].name.replace('CPU Team ', ''));
        if (!isNaN(lastNum)) botNumber = lastNum + 1;
    }

    // Fallback if regex fails or no CPU teams yet, use total count + 1 which is safe enough
    if (botNumber === 1 && count) botNumber = count + 1;

    const name = `CPU Team ${botNumber}`;

    // Insert Team (user_id is null)
    const { error } = await supabase.from("fantasy_teams").insert({
        league_id: leagueId,
        user_id: null, // Explicitly null for bots
        name: name,
        is_claimed: true
    });

    if (error) throw new Error(`Failed to create bot team: ${error.message}`);

    revalidatePath(`/fantasy/leagues/${leagueId}/settings`);
    revalidatePath(`/fantasy/leagues/${leagueId}`);
}
