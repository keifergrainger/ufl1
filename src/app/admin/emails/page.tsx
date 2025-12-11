import { createAdminClient } from '@/lib/supabase-admin'
import { Download, Mail, Calendar, Search } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminEmailsPage() {
    const supabase = createAdminClient()

    const { data: emails } = await supabase
        .from('mailing_list')
        .select('*')
        .order('created_at', { ascending: false })

    const totalSubscribers = emails?.length || 0
    const todayCount = emails?.filter(e => {
        const d = new Date(e.created_at)
        const today = new Date()
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    }).length || 0

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Email Subscribers</h2>
                    <p className="text-neutral-400">Manage your newsletter audience.</p>
                </div>
                <div className="flex gap-4">
                    <DownloadCsvButton emails={emails || []} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Subscribers</div>
                        <Mail className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-4xl font-black text-white">{totalSubscribers.toLocaleString()}</div>
                </div>
                <div className="bg-neutral-900 border border-white/10 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">New Today</div>
                        <Calendar className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-4xl font-black text-white">{todayCount}</div>
                </div>
            </div>

            {/* Email List Table */}
            <div className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-neutral-400" />
                        Subscriber List
                    </h3>
                    <div className="text-xs text-neutral-500 font-mono">
                        Showing all {totalSubscribers} records
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Email Address</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4 text-right">Date Subscribed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {emails && emails.length > 0 ? (
                                emails.map((sub: any) => (
                                    <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-white group-hover:text-blue-400 transition-colors">
                                            {sub.email}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-400">
                                            <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/5">
                                                {sub.source || 'web'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-neutral-500 font-mono">
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-neutral-500 italic">
                                        No subscribers yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function DownloadCsvButton({ emails }: { emails: any[] }) {
    // Client-side download logic via data URI
    // But this is a server component, so we need to inline the script or make a small client component.
    // Making this a simple "client component" via generic standard button that triggers download? 
    // Wait, Server Components can't have onClick. 
    // I'll define a quick Client Component inline or wrapper.
    // Actually, let's just make a data URL link.

    // NOTE: For large datasets, this approach (data URI) is bad. Ideally we'd have an API route. 
    // But for a simple list, a data URI link generated on the server is okay, 
    // EXCEPT server doesn't know "onClick".
    // Better: Create a Client Component for the button.

    return <ClientCsvDownload emails={emails} />
}

import { ClientCsvDownload } from './ClientCsvDownload'
