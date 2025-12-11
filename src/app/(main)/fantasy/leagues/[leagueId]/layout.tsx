import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FantasyShell from '@/components/fantasy/FantasyShell';
import { FantasyLeague, UflTeam } from '@/types/fantasy';
import { getTeamBrand } from '@/lib/fantasy/branding';

// Force dynamic rendering as we rely on route params and user auth state
export const dynamic = 'force-dynamic';

export default async function LeagueLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ leagueId: string }>;
}) {
    const supabase = await createClient();
    const { leagueId } = await params;

    // Fetch League Details
    const { data: league, error } = await supabase
        .from('fantasy_leagues')
        .select('*, primary_ufl_team:ufl_teams(*)')
        .eq('id', leagueId)
        .single();

    if (error || !league) {
        notFound();
    }

    const typedLeague = league as FantasyLeague & { primary_ufl_team: UflTeam };
    const brand = getTeamBrand(typedLeague.primary_ufl_team);

    const tabs = [
        { name: 'Overview', href: `/fantasy/leagues/${leagueId}` },
        { name: 'Standings', href: `/fantasy/leagues/${leagueId}/standings` },
        { name: 'Matchups', href: `/fantasy/leagues/${leagueId}/matchups` },
        { name: 'Teams', href: `/fantasy/leagues/${leagueId}/teams` },
        { name: 'Players', href: `/fantasy/leagues/${leagueId}/players` },
        { name: 'Draft', href: `/fantasy/leagues/${leagueId}/draft` },
    ];

    return (
        <FantasyShell>
            {/* League Header */}
            <div
                className="w-full bg-neutral-900 border-b border-white/10 pt-10 pb-0 shadow-xl relative overflow-hidden"
            >
                {/* Colorful Accent Background */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        background: `linear-gradient(to right, ${brand.primaryColor}, transparent)`
                    }}
                />

                <div className="container mx-auto px-4 max-w-6xl relative">
                    <div className="flex flex-col md:flex-row items-end md:items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                {typedLeague.primary_ufl_team?.slug === 'bham-stallions' && (
                                    <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                                        Official
                                    </span>
                                )}
                                <span className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                                    Season {typedLeague.season_year}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
                                {typedLeague.name}
                            </h1>
                        </div>

                        {/* Invite Code Display */}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Join Code
                            </span>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 text-green-100 font-mono text-xl font-bold tracking-widest select-all hover:bg-green-500/20 transition cursor-pointer group relative">
                                {typedLeague.league_code}
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                                    Share this code
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar scroll-smooth">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 border-b-2 border-transparent hover:border-white/20 transition whitespace-nowrap"
                            >
                                {tab.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-8 min-h-[60vh]">
                {children}
            </div>
        </FantasyShell>
    );
}
