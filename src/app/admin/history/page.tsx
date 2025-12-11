import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import HistoryList from './HistoryList'

export const dynamic = 'force-dynamic'

export default async function AdminHistoryPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/')
    }

    // Fetch history events sorted by display_order
    const { data: events } = await supabase
        .from('history_events')
        .select('*')
        .order('display_order', { ascending: true })

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-black uppercase italic text-white mb-2">Team History</h1>
                <p className="text-neutral-400">Manage the timeline of the Stallions legacy.</p>
            </div>

            <HistoryList initialEvents={events || []} />
        </div>
    )
}
