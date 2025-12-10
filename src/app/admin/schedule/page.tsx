import { createClient } from '@/lib/supabase-server'
import ScheduleList from './ScheduleList'

export default async function AdminSchedulePage() {
    const supabase = await createClient()
    const { data: games } = await supabase
        .from('games')
        .select('*')
        .order('week', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Season Schedule</h2>
                    <p className="text-neutral-400">Manage games, times, and results.</p>
                </div>
            </div>

            <ScheduleList games={games || []} />
        </div>
    )
}
