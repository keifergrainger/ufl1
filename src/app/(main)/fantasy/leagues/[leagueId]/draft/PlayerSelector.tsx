'use client';

import { useState } from 'react';
import { makeDraftPick } from './actions';
import Image from 'next/image';

type Player = {
    id: string;
    name: string;
    position: string;
    ufl_team: {
        slug: string;
        primary_color: string;
    } | null;
    taken: boolean;
};

export default function PlayerSelector({
    leagueId,
    players,
    isOnClock,
    currentTeamName
}: {
    leagueId: string,
    players: Player[],
    isOnClock: boolean,
    currentTeamName?: string
}) {
    const [search, setSearch] = useState('');
    const [filterPos, setFilterPos] = useState('ALL');
    const [pending, setPending] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

    // Filter Logic
    const filtered = players.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesPos = filterPos === 'ALL' || p.position === filterPos;
        return matchesSearch && matchesPos;
    });

    async function handleDraft(playerId: string) {
        if (!isOnClock) return;
        setPending(playerId);
        setError(null);

        const result = await makeDraftPick({ leagueId, playerId });
        if (result?.error) {
            setError(result.error);
            setPending(null);
        } else {
            // Success - Next.js revalidatePath will refresh, but we can clear specific pending
            setPending(null);
        }
    }

    return (
        <div className="flex flex-col h-full border border-neutral-800 bg-neutral-900/80 backdrop-blur rounded-xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-4 bg-neutral-950 border-b border-neutral-800">
                <h3 className="text-lg font-bold text-white mb-2">Available Players</h3>
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
                    />
                    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                        {positions.map(pos => (
                            <button
                                key={pos}
                                onClick={() => setFilterPos(pos)}
                                className={`px-2 py-1 text-xs font-bold rounded ${filterPos === pos ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'}`}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>
                {error && <div className="mt-2 text-red-500 text-xs font-bold">{error}</div>}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filtered.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-neutral-900 border border-neutral-800 rounded group hover:border-neutral-700">
                        <div className="flex items-center gap-3">
                            {/* Simple Avatar Placeholder */}
                            <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-xs font-bold text-gray-500">
                                {p.position}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-200">{p.name}</div>
                                <div className="text-[10px] text-gray-500 flex gap-2">
                                    <span>{p.ufl_team?.slug.replace('bham-', '').toUpperCase() || 'FA'}</span>
                                    {p.taken && <span className="text-red-500">TAKEN</span>}
                                </div>
                            </div>
                        </div>

                        {!p.taken ? (
                            <button
                                onClick={() => handleDraft(p.id)}
                                disabled={!isOnClock || !!pending}
                                className={`px-3 py-1 text-xs font-bold rounded uppercase transition-colors 
                                    ${isOnClock
                                        ? 'bg-green-600 hover:bg-green-500 text-white'
                                        : 'bg-neutral-800 text-gray-600 cursor-not-allowed'}`}
                            >
                                {pending === p.id ? 'Drafting...' : 'Draft'}
                            </button>
                        ) : (
                            <span className="text-xs text-gray-600 font-mono">OWNED</span>
                        )}
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="p-4 text-center text-gray-600 text-xs">No players found.</div>
                )}
            </div>

            {/* Footer Status */}
            <div className="p-3 bg-neutral-950 border-t border-neutral-800 text-xs text-center font-mono text-gray-500">
                {isOnClock ? (
                    <span className="text-green-500 animate-pulse">Your Turn! Draft a player.</span>
                ) : (
                    <span>Waiting for {currentTeamName}...</span>
                )}
            </div>
        </div>
    );
}
