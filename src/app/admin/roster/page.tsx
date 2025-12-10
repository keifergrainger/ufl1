import { createClient } from '@/lib/supabase-server'
import RosterList from './RosterList'

export default async function AdminRosterPage() {
    const supabase = await createClient()

    // Fetch all players
    const { data: players } = await supabase
        .from('players')
        .select('*')
        .order('number', { ascending: true }) // Sort by number initially

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Team Roster</h2>
                    <p className="text-neutral-400">Manage active players, positions, and units.</p>
                </div>
            </div>

            <RosterList players={players || []} />
        </div>
    )
}
