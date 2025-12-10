import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import PartnersList from './PartnersList'

export const dynamic = 'force-dynamic'

export default async function AdminPartnersPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/admin')
    }

    // Fetch partners
    const { data: partners } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-black uppercase italic text-white mb-2">Partners</h1>
                <p className="text-neutral-400">Manage official partners and sponsors.</p>
            </div>

            <PartnersList initialPartners={partners || []} />
        </div>
    )
}
