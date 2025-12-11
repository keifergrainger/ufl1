import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BioSection from "@/components/roster/BioSection";
import StatisticsSection, { SeasonStatRow } from "@/components/roster/StatisticsSection";
import LogPlayerView from "@/components/analytics/LogPlayerView";

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

    // --- PARSE FULL STATS FOR NEW SECTION ---
    let passingStats: SeasonStatRow[] = [];
    let rushingStats: SeasonStatRow[] = [];
    let receivingStats: SeasonStatRow[] = [];
    let defenseStats: SeasonStatRow[] = [];
    let returnStats: SeasonStatRow[] = [];
    let kickingStats: SeasonStatRow[] = [];

    if (stats && typeof stats === 'object') {
        const tableNames = Object.keys(stats);

        for (const tableName of tableNames) {
            const rows = stats[tableName];
            if (!rows || rows.length === 0) continue;

            const firstRow = rows[0];
            const keys = Object.keys(firstRow).map(k => k.toUpperCase());

            // Heuristics
            const isPassing = keys.includes('C-A-I') || (keys.includes('EFF') && keys.includes('YDS') && !keys.includes('REC'));
            const isRushing = keys.includes('ATT') && keys.includes('AVG') && keys.includes('NET');
            const isReceiving = keys.includes('REC') && keys.includes('YDS') && keys.includes('AVG');
            const isDefense = keys.includes('TKL') || keys.includes('SACKS') || keys.includes('SOLO');
            const isReturns = (keys.includes('KRET') || keys.includes('PRET') || keys.includes('RET')) && keys.includes('YDS');
            const isKicking = keys.includes('FGM') || keys.includes('XPM') || keys.includes('PUNTS');

            // Assign to ONE category (priority order)
            if (isPassing) passingStats = rows;
            else if (isReceiving) receivingStats = rows;
            else if (isRushing) rushingStats = rows;
            else if (isDefense) defenseStats = rows;
            else if (isReturns) returnStats = rows;
            else if (isKicking) kickingStats = rows;
        }

        // Fallback
        const hasSpecific = passingStats.length || rushingStats.length || receivingStats.length || defenseStats.length || returnStats.length || kickingStats.length;
        if (!hasSpecific && tableNames.length > 0) {
            passingStats = stats[tableNames[0]];
            if (tableNames.length >= 2) {
                rushingStats = stats[tableNames[1]];
            }
        }
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* 1. Back Link (Top Left) */}
            <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 pt-6 pb-2 relative z-20">
                <Link href="/roster" className="inline-flex items-center text-gray-400 hover:text-white transition text-sm font-bold uppercase tracking-wider">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roster
                </Link>
            </div>

            {/* 2. Compact Hero */}
            <div className="relative bg-gradient-to-b from-red-900 via-red-950 to-black overflow-hidden -mt-12 pt-16 pb-10">
                <div className="absolute inset-0 bg-black/20" />

                <div className="container mx-auto px-4 lg:px-6 max-w-6xl xl:max-w-7xl flex flex-col lg:flex-row items-end justify-between relative z-10 gap-8">

                    {/* Left Group: Image + Text */}
                    <div className="flex flex-col md:flex-row items-end gap-8 w-full lg:w-auto">
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

                    {/* Right: Season Snapshot (Moved Here) */}
                    {snapshotStats.length > 0 && (
                        <div className="w-full lg:w-auto min-w-[300px] bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-5 self-center lg:self-end mb-1">
                            <h2 className="text-sm font-bold mb-3 text-white/80 uppercase italic border-b border-white/10 pb-1 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-600 rounded-full" /> Season Snapshot
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {snapshotStats.map((stat, idx) => (
                                    <div key={idx} className="bg-black/40 p-2 rounded text-center border border-white/5">
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{stat.label}</div>
                                        <div className="text-xl font-black italic text-white">{stat.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Overview Row (Full Width Bio) */}
            <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 mt-8">
                <BioSection bio={player.bio} />
            </div>

            {/* 4. Statistics Section (New Component) */}
            <StatisticsSection
                passingStats={passingStats}
                rushingStats={rushingStats}
                receivingStats={receivingStats}
                defenseStats={defenseStats}
                returnStats={returnStats}
                kickingStats={kickingStats}
            />

            <LogPlayerView playerId={player.id} />
        </div>
    );
}
