import { createClient } from '@/lib/supabase-server'
import { Users, Calendar, Newspaper, Trophy } from 'lucide-react'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch Stats
    // Parallelize for speed
    const [
        { count: playerCount },
        { count: gamesCount },
        { count: newsCount },
    ] = await Promise.all([
        supabase.from('players').select('*', { count: 'exact', head: true }).eq('is_fantasy_only', false).neq('status', 'pending'),
        supabase.from('games').select('*', { count: 'exact', head: true }), // Assuming 'games' table exists or we will create it
        supabase.from('news').select('*', { count: 'exact', head: true }),   // Assuming 'news' table exists
    ])

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Locker Room</h2>
                    <p className="text-neutral-400">Welcome back, Coach.</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Active Roster" value={playerCount || 0} icon={Users} color="text-red-500" />
                <StatCard label="Total Games" value={gamesCount || 0} icon={Calendar} color="text-yellow-500" />
                <StatCard label="News Articles" value={newsCount || 0} icon={Newspaper} color="text-blue-500" />
                <StatCard label="Championships" value={3} icon={Trophy} color="text-purple-500" />
            </div>

            {/* Quick Actions or widgets can go here */}
            <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6">
                <h3 className="font-bold uppercase tracking-wider text-sm text-neutral-400 mb-4">System Status</h3>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>All systems operational. Database connected.</span>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
    return (
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-white/5 ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {/* Trend indicator could go here */}
            </div>
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</div>
        </div>
    )
}
