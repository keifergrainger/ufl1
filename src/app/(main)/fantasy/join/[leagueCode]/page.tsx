import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import FantasyShell from '@/components/fantasy/FantasyShell';
import { joinLeague } from '../../actions';

interface PageProps {
    params: Promise<{ leagueCode: string }>;
}

export default async function JoinLeaguePage({ params }: PageProps) {
    const { leagueCode } = await params;
    const supabase = await createClient();

    // Fetch league by code
    const { data: league } = await supabase
        .from('fantasy_leagues')
        .select(`
            *,
            members:fantasy_league_members(count),
            teams:fantasy_teams(id, name, is_claimed)
        `)
        .eq('league_code', leagueCode)
        .single();

    if (!league) {
        return notFound();
    }

    const totalTeams = league.max_teams;
    const claimedTeams = league.teams.filter((t: any) => t.is_claimed).length;
    const availableSpots = totalTeams - claimedTeams;
    const isFull = availableSpots <= 0;

    // Check if user is already in it
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: existingMember } = await supabase
            .from('fantasy_league_members')
            .select('role')
            .eq('league_id', league.id)
            .eq('user_id', user.id)
            .single();

        if (existingMember) {
            redirect(`/fantasy/leagues/${league.id}`);
        }
    }

    return (
        <FantasyShell>
            <div className="container mx-auto px-4 max-w-2xl py-20">
                <div className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                    <div className="h-4 bg-gradient-to-r from-red-600 to-black" />

                    <div className="p-8 text-center border-b border-white/5">
                        <span className="inline-block px-3 py-1 rounded bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-4">
                            You&apos;ve been invited
                        </span>
                        <h1 className="text-4xl font-black text-white italic uppercase mb-2">
                            {league.name}
                        </h1>
                        <p className="text-gray-400">Season {league.season_year}</p>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="flex justify-between items-center bg-black/30 p-4 rounded-lg border border-white/5">
                            <div className="text-left">
                                <div className="text-sm text-gray-500 uppercase font-bold">Spots Remaining</div>
                                <div className="text-2xl font-bold text-white">{availableSpots} / {totalTeams}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500 uppercase font-bold">Status</div>
                                <div className={`text-lg font-bold ${isFull ? 'text-red-500' : 'text-green-500'}`}>
                                    {isFull ? 'League Full' : 'Open to Join'}
                                </div>
                            </div>
                        </div>

                        {user ? (
                            isFull ? (
                                <div className="bg-red-900/20 border border-red-500/20 p-4 rounded-lg text-center text-red-200">
                                    Sorry, this league is full.
                                </div>
                            ) : (
                                <form action={async (formData) => {
                                    'use server'
                                    await joinLeague(formData)
                                }} className="space-y-4">
                                    <input type="hidden" name="code" value={leagueCode} />
                                    <div>
                                        <label htmlFor="teamName" className="block text-sm text-left font-bold text-gray-400 uppercase mb-1">
                                            Your Team Name
                                        </label>
                                        <input
                                            name="teamName"
                                            required
                                            placeholder="e.g. Stallions Fan 24"
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-white/30"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-white text-black font-black text-xl py-4 rounded-lg uppercase hover:bg-gray-200 transition-transform active:scale-95"
                                    >
                                        Join & Create Team
                                    </button>
                                    <p className="text-center text-gray-500 text-sm">
                                        You'll be added to the league immediately.
                                    </p>
                                </form>
                            )
                        ) : (
                            <div className="text-center">
                                <p className="text-gray-400 mb-4">You need an account to join.</p>
                                <Link
                                    href={`/login?next=/fantasy/join/${leagueCode}`}
                                    className="block w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg uppercase"
                                >
                                    Log In to Join
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center mt-8">
                    <Link href="/fantasy" className="text-gray-500 hover:text-white transition-colors text-sm uppercase font-bold">
                        No thanks, go to dashboard
                    </Link>
                </div>
            </div>
        </FantasyShell>
    );
}
