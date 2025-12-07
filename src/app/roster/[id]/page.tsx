
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Server Component
export default async function PlayerPage({ params }: { params: { id: string } }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { id } = await params;

    const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !player) {
        notFound();
    }

    // Stats parsing
    let stats = player.stats;
    if (typeof stats === 'string') {
        try { stats = JSON.parse(stats); } catch (e) { }
    }

    // --- DERIVE SNAPSHOT STATS ---
    // Scan all tables to find the most relevant stats (matching priority keys)
    let snapshotStats: { label: string; value: string }[] = [];

    if (stats && typeof stats === 'object') {
        const priorityKeys = ['YDS', 'TD', 'TKL', 'SACKS', 'INT', 'REC', 'ATT', 'C-A-I'];

        // Find a suitable row in any table
        for (const tableName of Object.keys(stats)) {
            const rows = stats[tableName];
            if (!rows || rows.length === 0) continue;

            const row = rows[0]; // Take first row (usually current season)

            // Check if this row has any of our priority keys
            const foundKeys = Object.keys(row).filter(k => priorityKeys.includes(k.toUpperCase()));

            if (foundKeys.length > 0) {
                // Found a good table! Extract stats.
                // Use found priority keys, or fallback to first few keys
                let targetKeys = foundKeys;

                // If we have too many, slice.
                if (targetKeys.length > 4) targetKeys = targetKeys.slice(0, 4);

                targetKeys.forEach(key => {
                    snapshotStats.push({ label: key, value: row[key] });
                });

                // Stop after finding the first good table
                break;
            }
        }

        // Fallback: If no priority keys found in ANY table, but tables exist, just take first row of first table
        if (snapshotStats.length === 0 && Object.keys(stats).length > 0) {
            const firstTableName = Object.keys(stats)[0];
            const rows = stats[firstTableName];
            if (rows && rows.length > 0) {
                const row = rows[0];
                const validKeys = Object.keys(row).filter(k => !['YEAR', 'TEAM', 'SEASON'].includes(k.toUpperCase())).slice(0, 4);
                validKeys.forEach(key => {
                    snapshotStats.push({ label: key, value: row[key] });
                });
            }
        }
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* 1. Back Link (Top Left) */}
            <div className="container mx-auto px-4 pt-6 pb-2 relative z-20">
                <Link href="/roster" className="inline-flex items-center text-gray-400 hover:text-white transition text-sm font-bold uppercase tracking-wider">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roster
                </Link>
            </div>

            {/* 2. Compact Hero */}
            <div className="relative bg-gradient-to-b from-red-900 via-red-950 to-black overflow-hidden -mt-12 pt-16 pb-10">
                <div className="absolute inset-0 bg-black/20" />

                <div className="container mx-auto px-4 flex flex-col md:flex-row items-end justify-start relative z-10 gap-8">
                    {/* Image */}
                    {player.image_url ? (
                        <img
                            src={player.image_url}
                            alt={player.name}
                            className="w-40 h-40 md:w-56 md:h-56 object-cover rounded-lg shadow-2xl skew-x-[-2deg] border-4 border-white/10 bg-neutral-800"
                        />
                    ) : (
                        <div className="w-40 h-40 md:w-56 md:h-56 bg-neutral-800 rounded-lg flex items-center justify-center">No Image</div>
                    )}

                    <div className="flex-1 text-center md:text-left mb-1">
                        <div className="text-red-500 font-bold tracking-widest text-sm md:text-base mb-1">{player.position} • {player.unit || 'STALLION'}</div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-1 leading-none">
                            <span className="text-white">{player.name}</span>
                        </h1>
                        <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start text-gray-300 font-mono text-xs md:text-sm">
                            <span className="bg-white/10 px-3 py-1 rounded">#{player.number}</span>
                            {player.height && <span>{player.height}</span>}
                            {player.weight && <span>| {player.weight}</span>}
                            {player.college && <span>| {player.college}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Overview Row (Grid) */}
            <div className={`container mx-auto px-4 mt-8 grid gap-8 items-start ${snapshotStats.length > 0 ? 'grid-cols-1 lg:grid-cols-[1fr_300px]' : 'grid-cols-1'}`}>

                {/* Left: Bio / Career */}
                <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/5">
                    <h2 className="text-xl font-bold mb-4 text-red-500 uppercase border-b border-red-500/30 pb-2">Bio / Career</h2>
                    <div className="prose prose-invert prose-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto pr-2">
                        {player.bio || "No bio available."}
                    </div>
                </div>

                {/* Right: Season Snapshot (Box) */}
                {snapshotStats.length > 0 && (
                    <div className="bg-neutral-900 rounded-xl border border-white/5 p-6 h-fit sticky top-4">
                        <h2 className="text-lg font-bold mb-4 text-white uppercase italic border-b border-white/10 pb-2">Season Snapshot</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {snapshotStats.map((stat, idx) => (
                                <div key={idx} className="bg-black/30 p-3 rounded-lg text-center border border-white/5">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{stat.label}</div>
                                    <div className="text-2xl font-black italic text-white">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 4. Statistics Section */}
            <div className="container mx-auto px-4 mt-12 mb-20">
                <h2 className="text-3xl font-black uppercase italic mb-6 border-l-8 border-red-600 pl-4">Statistics</h2>

                {(!stats || Object.keys(stats).length === 0) ? (
                    <div className="text-gray-500 italic">No stats available.</div>
                ) : (
                    // Render specific "Season Stats" or ALL tables if "Season Stats" not found specifically
                    Object.entries(stats).map(([tableName, rows]: [string, any[]]) => {
                        const cleanTitle = tableName.replace(/Table \d+/, 'Season Stats').toUpperCase();

                        return (
                            <div key={tableName} className="mb-10">
                                <h3 className="text-lg font-bold text-gray-400 mb-3">{cleanTitle}</h3>
                                <div className="bg-neutral-900 rounded-lg border border-white/10 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-white/5 text-gray-400 border-b border-white/10 divide-x divide-white/5">
                                                    {rows.length > 0 && Object.keys(rows[0]).map((header) => (
                                                        <th key={header} className="px-6 py-4 text-center font-bold uppercase tracking-wider text-xs whitespace-nowrap">
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {rows.map((row, i) => (
                                                    <tr key={i} className="hover:bg-white/5 transition divide-x divide-white/5">
                                                        {Object.entries(row).map(([key, val]: [string, any], j) => (
                                                            <td key={j} className={`px-6 py-4 whitespace-nowrap text-gray-200 font-mono ${key.toLowerCase().includes('team') || key.toLowerCase().includes('season')
                                                                    ? 'text-left font-sans font-bold text-white'
                                                                    : 'text-center'
                                                                }`}>
                                                                {val}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
