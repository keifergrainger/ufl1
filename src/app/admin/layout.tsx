import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { LayoutDashboard, Calendar, Users, Newspaper, History, Settings, Ticket, Handshake, Trophy, BarChart, Mail } from 'lucide-react'
import Branding from '@/components/Branding'
import { protectAdminRoute } from '@/lib/auth'
import SignOutButton from './SignOutButton'
import ViewLiveSiteButton from './ViewLiveSiteButton'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Verify Admin Access
    await protectAdminRoute();

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-neutral-900/50 flex flex-col fixed inset-y-0 left-0 z-50">
                <div className="h-20 flex items-center justify-center border-b border-white/10">
                    <Branding />
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <AdminNavLink href="/" icon={LayoutDashboard} label="Dashboard" />

                    <div className="pt-4 pb-2 px-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">Team</div>
                    <AdminNavLink href="/roster" icon={Users} label="Roster" />
                    <AdminNavLink href="/coaches" icon={Users} label="Coaches" />

                    <div className="pt-4 pb-2 px-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">Season</div>
                    <AdminNavLink href="/schedule" icon={Calendar} label="Schedule" />
                    <AdminNavLink href="/gameday" icon={Ticket} label="Game Day" />

                    <div className="pt-4 pb-2 px-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">Content</div>
                    <AdminNavLink href="/news" icon={Newspaper} label="News" />
                    <AdminNavLink href="/emails" icon={Mail} label="Subscribers" />
                    <AdminNavLink href="/history" icon={History} label="History" />
                    <AdminNavLink href="/partners" icon={Handshake} label="Partners" />

                    <div className="pt-4 pb-2 px-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">System</div>
                    <AdminNavLink href="/analytics" icon={BarChart} label="Analytics" />
                    <AdminNavLink href="/fantasy" icon={Trophy} label="Fantasy" />
                    <AdminNavLink href="/settings" icon={Settings} label="Settings" />
                </nav>

                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="text-xs text-neutral-500 mb-2 truncate font-mono">{user.email}</div>
                    <form action="/auth/signout" method="post">
                        <SignOutButton />
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen bg-neutral-950">
                <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-8">
                    <h1 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Admin Console</h1>
                    <ViewLiveSiteButton />
                </header>
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}

function AdminNavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-300 rounded hover:bg-white/5 hover:text-white transition-colors">
            <Icon className="w-4 h-4" />
            {label}
        </Link>
    )
}
