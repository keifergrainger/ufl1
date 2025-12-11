"use client";

import { cn } from "@/lib/utils";

export interface SeasonStatRow {
    [key: string]: string | number;
}

interface StatisticsSectionProps {
    passingStats?: SeasonStatRow[];
    rushingStats?: SeasonStatRow[];
    receivingStats?: SeasonStatRow[];
    defenseStats?: SeasonStatRow[];
    returnStats?: SeasonStatRow[];
    kickingStats?: SeasonStatRow[];
}

export default function StatisticsSection({
    passingStats = [],
    rushingStats = [],
    receivingStats = [],
    defenseStats = [],
    returnStats = [],
    kickingStats = []
}: StatisticsSectionProps) {
    return (
        <section className="w-full max-w-6xl mx-auto px-4 lg:px-6 mt-12 mb-20">
            <h2 className="text-3xl font-black uppercase italic mb-8 border-l-8 border-red-600 pl-4 text-white">
                Statistics
            </h2>

            <div className="w-full bg-neutral-900/40 border border-white/10 rounded-xl overflow-hidden shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-black uppercase text-white mb-2">Coming Soon</h3>
                <p className="text-gray-400">Detailed player statistics will be available shortly.</p>
            </div>
        </section>
    );
}

function StatsBlock({
    title,
    stats,
    orderedKeys,
    headerMap
}: {
    title: string;
    stats: SeasonStatRow[];
    orderedKeys: string[];
    headerMap: Record<string, string>;
}) {
    // If raw stats have keys that aren't in orderedKeys, we might want to include them or filter.
    // For now, let's strictly follow orderedKeys but fallback to all keys if orderedKeys don't match data.

    // Safety check: verify at least some orderedKeys exist in the first row of data
    // If not, fall back to just plotting all keys present in the data
    const firstRowKeys = stats.length > 0 ? Object.keys(stats[0]).map(k => k.toUpperCase()) : [];
    const validOrderedKeys = orderedKeys.filter(k => firstRowKeys.some(fk => fk.includes(k) || k.includes(fk) || firstRowKeys.includes(k)));

    // If we have minimal overlap (e.g. data has totally different keys), use the data's keys
    const columnsToRender = validOrderedKeys.length >= 2 ? validOrderedKeys : firstRowKeys;

    return (
        <div className="w-full bg-neutral-900/40 border border-white/10 rounded-xl overflow-hidden shadow-sm">
            {/* Title Bar */}
            <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="h-4 w-1 bg-red-600 rounded-full" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">{title}</h3>
            </div>

            {/* Table Container */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                    <thead>
                        <tr className="bg-black/20 text-gray-400 border-b border-white/10">
                            {columnsToRender.map((key) => (
                                <th key={key} className="px-6 py-4 text-center font-bold uppercase tracking-wider text-[11px] text-[#C5B783]">
                                    {/* Use Mapped Header or Key itself */}
                                    {headerMap[key] || key}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {stats.map((row, i) => (
                            <tr key={i} className={`hover:bg-white/5 transition group ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                                {columnsToRender.map((colKey, j) => {
                                    // fuzzy match the data key to the column key
                                    // e.g. colKey="YDS" might match row key "Yds" or "YDS"
                                    const dataKey = Object.keys(row).find(k => k.toUpperCase() === colKey.toUpperCase()) || colKey;
                                    const val = row[dataKey] ?? "-";

                                    const isTeamOrSeason = colKey === "TEAM" || colKey === "SEASON";

                                    return (
                                        <td key={j} className={cn(
                                            "px-6 py-4 font-mono text-gray-300 text-xs md:text-sm whitespace-nowrap",
                                            isTeamOrSeason ? "text-right font-sans font-bold text-white tracking-tight" : "text-center",
                                            colKey === "TD" && "text-white font-bold" // Highlight TDs
                                        )}>
                                            {val}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Helper Text */}
            <div className="md:hidden p-2 text-right bg-black/20 border-t border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Swipe for more →</span>
            </div>
        </div>
    );
}
