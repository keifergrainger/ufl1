import { createClient } from '@/lib/supabase-server'
import CoachesList from './CoachesList'

export default async function AdminCoachesPage() {
    const supabase = await createClient()

    const { data: coaches } = await supabase
        .from('coaches')
        .select('*')
        .order('sort_order', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Coaching Staff</h2>
                    <p className="text-neutral-400">Manage coaches appearing on the roster page.</p>
                </div>
            </div>

            <CoachesList coaches={coaches || []} />
        </div>
    )
}
