import { createClient } from '@/lib/supabase-server'
import PendingApprovals from './PendingApprovals'
import RosterList from './RosterList'

export default async function AdminRosterPage() {
    const supabase = await createClient()

    // Fetch all players
    const { data: players } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false }) // Sort by newest first to see imports at top

    // Split into pending and active
    const pendingPlayers = players?.filter(p => p.status === 'pending') || []
    const activePlayers = players?.filter(p => p.status !== 'pending') || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Team Roster</h2>
                    <p className="text-neutral-400">Manage active players, positions, and units.</p>
                </div>
            </div>

            <PendingApprovals players={pendingPlayers} />

            <div className="border-t border-white/10 pt-8">
                <h3 className="text-xl font-bold uppercase text-white mb-4">Active Roster</h3>
                <RosterList players={activePlayers} />
            </div>
        </div>
    )
}
