import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import FantasyShell from '@/components/fantasy/FantasyShell';
import { getTeamBrand } from '@/lib/fantasy/branding';
// JoinLeagueCard import removed

async function MyLeaguesList({ userId }: { userId: string }) {
    const supabase = await createClient();

    const { data: memberships } = await supabase
        .from('fantasy_league_members')
        .select('role, league:fantasy_leagues(*, primary_ufl_team:ufl_teams(*))')
        .eq('user_id', userId);

    if (!memberships || memberships.length === 0) {
        return (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                <h3 className="text-xl font-medium text-white mb-2">No Active Leagues</h3>
                <p className="text-gray-400 mb-6 max-w-sm mx-auto">
                    You aren&apos;t part of any leagues yet. Create your own or join one with a code!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map((m: any) => {
                const league = m.league;
                // Fallback brand if no primary team
                const brand = league.primary_ufl_team
                    ? getTeamBrand(league.primary_ufl_team)
                    : { primaryColor: '#b91c1c', secondaryColor: '#000000' };

                return (
                    <Link
                        key={league.id}
                        href={`/fantasy/leagues/${league.id}`}
                        className="block bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-600 transition group relative"
                    >
                        <div className="h-2 w-full" style={{ backgroundColor: brand.primaryColor }} />
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-lg font-bold text-gray-100 group-hover:text-white truncate pr-4">
                                    {league.name}
                                </h4>
                                {m.role === 'commissioner' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-500 uppercase">
                                        Commish
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500 flex justify-between">
                                <span>Season {league.season_year}</span>
                                <span className="text-xs bg-white/10 px-2 py-1 rounded">
                                    {league.league_code || 'No Code'}
                                </span>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

export default async function FantasyPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <FantasyShell>
            {/* Hero */}
            <section className="relative py-16 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border-b border-white/5">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
                        Stallions <span className="text-red-600">Fantasy</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl">
                        The official fantasy platform of the Birmingham Stallions.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 max-w-6xl py-12 space-y-16">

                {/* Actions Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Create League */}
                    <Link href="/fantasy/create" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-900/50 to-black border border-green-500/30 hover:border-green-500 transition-all p-8 flex flex-col justify-between h-64">
                        <div className="absolute inset-0 bg-green-600/10 group-hover:bg-green-600/20 transition-colors" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white uppercase italic mb-2">Create League</h2>
                            <p className="text-green-200/80">Start a new dynasty. Be the commissioner.</p>
                        </div>
                        <div className="relative z-10 self-start mt-4 bg-green-600 text-white font-bold px-6 py-3 rounded-full uppercase tracking-wide group-hover:scale-105 transition-transform">
                            Create &rarr;
                        </div>
                    </Link>

                    {/* Join League */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/50 to-black border border-blue-500/30 p-8 flex flex-col justify-between h-64">
                        <div className="absolute inset-0 bg-blue-600/10" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white uppercase italic mb-2">Join League</h2>
                            <p className="text-blue-200/80">Have an invite code? Enter it here.</p>
                        </div>
                        <div className="relative z-10 mt-6">
                            <form action={async (formData) => {
                                'use server';
                                const code = formData.get('code') as string;
                                if (code) {
                                    const { redirect } = await import('next/navigation');
                                    redirect(`/fantasy/join/${code}`);
                                }
                            }} className="flex gap-2">
                                <input
                                    name="code"
                                    type="text"
                                    placeholder="Enter Code (e.g. A7X9Z)"
                                    className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white uppercase font-mono tracking-widest focus:outline-none focus:border-blue-500 transition-colors"
                                    required
                                />
                                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg uppercase transition-colors">
                                    Join
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* My Leagues (User only) */}
                {user && (
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-white uppercase italic tracking-tight">Your Leagues</h2>
                        </div>
                        <MyLeaguesList userId={user.id} />
                    </section>
                )}
            </div>
        </FantasyShell>
    );
}
