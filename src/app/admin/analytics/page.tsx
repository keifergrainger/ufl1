
import { createAdminClient } from '@/lib/supabase-admin'
import { AutoRefresh } from '@/components/AutoRefresh'
import { Users, Clock, Map, PieChart, Activity, ShoppingBag, Ticket, Server, Database, Globe } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
    const supabase = createAdminClient()

    // 1. Total Unique Visitors (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: periodEvents } = await supabase
        .from('analytics_events')
        .select('visitor_id')
        .gte('created_at', thirtyDaysAgo.toISOString())

    // Count unique visitors (based on visitor_id from localStorage, which persists across browser sessions)
    const uniqueVisitors = new Set(periodEvents?.map(e => e.visitor_id).filter(Boolean)).size
    const totalVisitors = uniqueVisitors

    // 2. Fetch Recent Events for Aggregation
    const { data: recentEvents } = await supabase
        .from('analytics_events')
        .select('page, event_type, section, player_id, visitor_id, session_id, created_at')
        .order('created_at', { ascending: false })
        .limit(2000)

    // 3. Most Viewed Section
    const sectionCounts: Record<string, number> = {}
    recentEvents?.forEach(e => {
        const key = e.section || 'General' // Default to 'General' if null
        sectionCounts[key] = (sectionCounts[key] || 0) + 1
    })
    const topSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0]

    // 4. Returning vs New (using same 30-day period)
    // Fetch visitor sessions within the same period
    const { data: periodEventsForSessions } = await supabase
        .from('analytics_events')
        .select('visitor_id, session_id')
        .gte('created_at', thirtyDaysAgo.toISOString())

    const sessionsPerVisitor: Record<string, Set<string>> = {}
    periodEventsForSessions?.forEach(e => {
        if (e.visitor_id && e.session_id) {
            if (!sessionsPerVisitor[e.visitor_id]) sessionsPerVisitor[e.visitor_id] = new Set()
            sessionsPerVisitor[e.visitor_id].add(e.session_id)
        }
    })

    let newVisitors = 0
    let returningVisitors = 0
    Object.values(sessionsPerVisitor).forEach(sessions => {
        if (sessions.size === 1) newVisitors++
        else returningVisitors++
    })

    // 5. Avg Time on Site
    const sessionDurations: Record<string, { start: number, end: number }> = {}
    recentEvents?.forEach(e => {
        if (!e.session_id) return
        const time = new Date(e.created_at).getTime()
        if (!sessionDurations[e.session_id]) {
            sessionDurations[e.session_id] = { start: time, end: time }
        } else {
            sessionDurations[e.session_id].start = Math.min(sessionDurations[e.session_id].start, time)
            sessionDurations[e.session_id].end = Math.max(sessionDurations[e.session_id].end, time)
        }
    })

    let totalDurationMs = 0
    let sessionCount = 0
    Object.values(sessionDurations).forEach(s => {
        const duration = s.end - s.start
        if (duration > 0) {
            totalDurationMs += duration
            sessionCount++
        }
    })

    const avgTimeMs = sessionCount > 0 ? totalDurationMs / sessionCount : 0
    const minutes = Math.floor(avgTimeMs / 60000)
    const seconds = Math.floor((avgTimeMs % 60000) / 1000)
    const avgTimeDisplay = `${minutes}m ${seconds}s`

    // 6. Commerce Stats
    const merchClicks = recentEvents?.filter(e => e.event_type === 'merch_click').length || 0
    const ticketClicks = recentEvents?.filter(e => e.event_type === 'ticket_click').length || 0

    // 7. Player Popularity
    const { data: players } = await supabase.from('players').select('id, name, position')

    const playerViews: Record<string, number> = {}
    recentEvents?.forEach(e => {
        if (e.event_type === 'player_view' && e.player_id) {
            playerViews[e.player_id] = (playerViews[e.player_id] || 0) + 1
        }
    })

    const topPlayers = Object.entries(playerViews)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, views]) => {
            const player = players?.find(p => p.id === id)
            return {
                id,
                name: player?.name || 'Unknown Player',
                position: player?.position || '--',
                views
            }
        })

    // 8. Calculate Player Insights
    let playerInsight = ''
    if (topPlayers.length > 0 && Object.keys(playerViews).length > 1) {
        const totalViews = Object.values(playerViews).reduce((sum, views) => sum + views, 0)
        const avgViews = totalViews / Object.keys(playerViews).length
        const topPlayerViews = topPlayers[0].views

        if (topPlayerViews > avgViews * 2) {
            const multiplier = Math.round(topPlayerViews / avgViews)
            playerInsight = `Top players are receiving ${multiplier}x more views than average.`
        } else if (topPlayerViews > avgViews * 1.5) {
            playerInsight = `Top players are receiving 50% more views than average.`
        } else {
            playerInsight = `Player views are evenly distributed across the roster.`
        }
    }


    return (
        <div className="space-y-8">
            <AutoRefresh intervalMs={3000} />
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Analytics Dashboard</h2>
                    <p className="text-neutral-400">Real-time site performance metrics.</p>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard
                    label="Total Visitors"
                    value={totalVisitors.toLocaleString()}
                    icon={Users}
                    color="text-blue-500"
                    sparklineData={[40, 30, 45, 50, 60, 55, 70]}
                />
                <AnalyticsCard
                    label="Returning vs New"
                    value={`${returningVisitors} / ${newVisitors}`}
                    subValue="Returning / New"
                    icon={PieChart}
                    color="text-purple-500"
                    sparklineData={[20, 25, 22, 30, 28, 35, 40]}
                />
                <AnalyticsCard
                    label="Most Viewed Section"
                    value={topSection ? topSection[0] : "N/A"}
                    subValue={topSection ? `${topSection[1]} views` : undefined}
                    icon={Map}
                    color="text-yellow-500"
                    sparklineData={[60, 65, 60, 70, 75, 80, 85]}
                />
                <AnalyticsCard
                    label="Avg. Time on Site"
                    value={avgTimeDisplay}
                    icon={Clock}
                    color="text-green-500"
                    sparklineData={[10, 15, 12, 20, 18, 25, 30]}
                />
            </div>

            {/* Player Popularity Metrics */}
            <div>
                <h3 className="text-xl font-bold uppercase text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-500" />
                    Player Popularity Metrics
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Top 10 Table */}
                    <div className="lg:col-span-2 bg-neutral-900/50 border border-white/5 rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h4 className="font-bold text-sm uppercase text-neutral-400">Top 5 Most Viewed Players</h4>
                            <button className="text-xs font-bold text-red-500 hover:text-white transition-colors">Export CSV</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Rank</th>
                                        <th className="px-4 py-3">Player</th>
                                        <th className="px-4 py-3">Position</th>
                                        <th className="px-4 py-3 text-right">Views</th>
                                        <th className="px-4 py-3 text-right">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {topPlayers.length > 0 ? (
                                        topPlayers.map((player, i) => (
                                            <tr key={player.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-mono text-neutral-500">#{i + 1}</td>
                                                <td className="px-4 py-3 font-bold text-white">{player.name}</td>
                                                <td className="px-4 py-3 text-neutral-400">{player.position}</td>
                                                <td className="px-4 py-3 text-right font-mono text-white">{player.views}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-neutral-500 text-xs font-bold">--</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 italic">
                                                No player data yet. Visit roster pages to generate data.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Trending Carousel */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm uppercase text-neutral-400">Trending Now</h4>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {topPlayers.slice(0, 3).map((player, i) => (
                                <div key={i} className="bg-neutral-900 border border-white/10 rounded-lg p-4 flex items-center gap-4 hover:border-red-500/50 transition-colors group cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-lg font-black italic text-neutral-700 group-hover:text-red-500 group-hover:bg-red-500/10 transition-colors">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-white group-hover:text-red-500 transition-colors">{player.name}</div>
                                        <div className="text-xs text-neutral-500">{player.views} views this month</div>
                                    </div>
                                    <div className="text-neutral-500 font-bold text-xs flex items-center gap-1">
                                        <Activity className="w-3 h-3" />
                                        --
                                    </div>
                                </div>
                            ))}
                            {topPlayers.length === 0 && (
                                <div className="text-sm text-neutral-500 italic">No trending players.</div>
                            )}
                        </div>

                        {playerInsight ? (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-xs text-blue-400">
                                <strong>Insight:</strong> {playerInsight}
                            </div>
                        ) : (
                            <div className="bg-neutral-900/50 border border-white/5 rounded-lg p-4 text-xs text-neutral-500 italic">
                                No insight available yet. Visit player pages to generate data.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Commerce Funnel Insights */}
            <div>
                <h3 className="text-xl font-bold uppercase text-white mb-6 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-green-500" />
                    Commerce Funnel Insights
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Merch Clicks */}
                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Merch Store Clicks</div>
                            <ShoppingBag className="w-4 h-4 text-neutral-500" />
                        </div>
                        <div className="text-3xl font-black text-white mb-2">{merchClicks}</div>
                        <div className="text-sm text-neutral-500 font-bold flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            -- <span className="text-neutral-500 font-normal ml-1">vs last week</span>
                        </div>
                        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-white/10 w-[0%]" />
                        </div>
                    </div>

                    {/* Ticket Clicks */}
                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Ticket Page Clicks</div>
                            <Ticket className="w-4 h-4 text-neutral-500" />
                        </div>
                        <div className="text-3xl font-black text-white mb-2">{ticketClicks}</div>
                        <div className="text-sm text-neutral-500 font-bold flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            -- <span className="text-neutral-500 font-normal ml-1">vs last week</span>
                        </div>
                        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-white/10 w-[0%]" />
                        </div>
                    </div>

                    {/* Conversion Heatmap Placeholder */}
                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 flex flex-col hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Conversion Intent</div>
                            <div className="text-xs font-mono text-neutral-600">HEATMAP</div>
                        </div>
                        <div className="flex-1 w-full rounded bg-gradient-to-r from-blue-900/20 via-purple-900/40 to-red-900/60 border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold uppercase text-white tracking-widest bg-black/50 px-3 py-1 rounded backdrop-blur-sm">
                                    High Intent Areas
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 flex justify-between text-xs text-neutral-500 font-mono">
                            <span>Low</span>
                            <span>High</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Health & Data Integrity */}
            <div>
                <h3 className="text-xl font-bold uppercase text-white mb-6 flex items-center gap-2">
                    <Server className="w-5 h-5 text-neutral-400" />
                    System Health & Data Integrity
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SystemHealthCard
                        label="Page Load Speed"
                        value="-- ms"
                        status="warning"
                        subLabel="P95 Latency"
                        icon={Clock}
                    />
                    <SystemHealthCard
                        label="API Response"
                        value="-- ms"
                        status="warning"
                        subLabel="Avg. Latency"
                        icon={Activity}
                    />
                    <SystemHealthCard
                        label="Uptime"
                        value="--%"
                        status="warning"
                        subLabel="Last 30 Days"
                        icon={Globe}
                    />
                    <SystemHealthCard
                        label="Data Completeness"
                        value="--%"
                        status="warning"
                        subLabel="Roster Integrity"
                        icon={Database}
                    />
                </div>
            </div>
        </div>
    )
}

function SystemHealthCard({
    label,
    value,
    status,
    subLabel,
    icon: Icon
}: {
    label: string,
    value: string,
    status: 'good' | 'warning' | 'critical',
    subLabel: string,
    icon: any
}) {
    const statusColors = {
        good: 'text-green-500 bg-green-500/10 border-green-500/20',
        warning: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        critical: 'text-red-500 bg-red-500/10 border-red-500/20'
    }

    // Status badges small
    const badgeColors = {
        good: 'bg-green-500',
        warning: 'bg-yellow-500',
        critical: 'bg-red-500'
    }

    return (
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</div>
                <Icon className="w-4 h-4 text-neutral-600" />
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-2xl font-black text-white mb-1">{value}</div>
                    <div className="text-xs text-neutral-500">{subLabel}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1.5 ${statusColors[status]}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${badgeColors[status]}`} />
                    {status}
                </div>
            </div>
        </div>
    )
}

function AnalyticsCard({
    label,
    value,
    subValue,
    icon: Icon,
    color,
    sparklineData
}: {
    label: string;
    value: string;
    subValue?: string;
    icon: any;
    color: string;
    sparklineData: number[];
}) {
    return (
        <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-white/5 ${color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-black text-white mb-1 group-hover:scale-105 transition-transform origin-left">{value}</div>
                {subValue && <div className="text-xs text-neutral-500 mb-1">{subValue}</div>}
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</div>
            </div>

            {/* Sparkline Background */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkline data={sparklineData} color="currentColor" className={color} />
            </div>
        </div>
    )
}

function Sparkline({ data, color, className }: { data: number[]; color: string; className?: string }) {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    // Create points string
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100
        const y = 100 - ((d - min) / range) * 100
        return `${x},${y}`
    }).join(' ')

    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`w-full h-full ${className}`}>
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )
}
