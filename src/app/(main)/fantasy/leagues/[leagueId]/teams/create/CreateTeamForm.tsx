'use client';

import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateTeamForm({ leagueId }: { leagueId: string }) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('You must be logged in to create a team.');
                return;
            }

            // 1. Create Team
            const { data: team, error } = await supabase
                .from('fantasy_teams')
                .insert({
                    league_id: leagueId,
                    user_id: user.id,
                    name,
                    wins: 0,
                    losses: 0,
                    ties: 0,
                    points_for: 0,
                    points_against: 0
                })
                .select()
                .single();

            if (error) throw error;

            // 2. Ensure user is a member (if not already)
            // This is a safety check/auto-join mechanism
            const { error: memberError } = await supabase
                .from('fantasy_league_members')
                .upsert({
                    league_id: leagueId,
                    user_id: user.id,
                    role: 'member' // Default to member, if they are commissioner explicit insert handles that separately or ignore if conflict
                }, { onConflict: 'league_id, user_id', ignoreDuplicates: true }); // Don't overwrite if existing (e.g. commissioner)

            // Actually, upsert with ignoreDuplicates might not be sufficient if we want to preserve role.
            // Better to just try insert and ignore error, or check first.
            // For now, let's assume they are already a member via Invite/Create League flow, or we rely on the RLS to fail if they aren't.
            // But if this is the "Join & Create" flow, we might need to insert member.
            // Given the current MVP, let's stick to: "You must be a member to create a team" (enforced by RLS) OR "Creating a team adds you".
            // Let's assume the latter is more user friendly.

            if (memberError) console.warn('Member check failed/skipped', memberError);

            router.push(`/fantasy/leagues/${leagueId}/teams/${team.id}`);
            router.refresh();

        } catch (err: any) {
            console.error(err);
            alert('Error creating team: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleCreate} className="bg-neutral-900 border border-white/10 p-8 rounded-xl space-y-6">
            <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Team Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Birmingham Iron"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 rounded focus:outline-none focus:border-red-600 transition"
                    required
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest py-4 rounded transition"
                >
                    {loading ? 'Creating...' : 'Create Team'}
                </button>
            </div>

            <p className="text-xs text-gray-600 text-center">
                Fantasy sports should be fun. Play fair.
            </p>
        </form>
    );
}
