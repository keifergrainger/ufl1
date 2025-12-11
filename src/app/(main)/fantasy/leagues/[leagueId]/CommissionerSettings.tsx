'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateLeagueDetails, regenerateLeagueCode, updateMaxTeams, deleteTeam, startLeague, resetLeague, archiveLeague, deleteLeague, addPlaceholderTeam } from '../../actions';
import { Lock, Eye, RefreshCw, AlertTriangle, Trash2, Archive } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CommissionerSettingsProps {
    league: any;
    teams: any[];
    hasStarted: boolean;
    userId: string;
}

export default function CommissionerSettings({ league, teams, hasStarted, userId }: CommissionerSettingsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState(league.name);
    const [visibility, setVisibility] = useState(league.is_public ? 'public' : 'private');
    const [maxTeams, setMaxTeams] = useState(league.max_teams);

    // Sync state with props when league data updates (e.g. after save or re-fetch)
    useEffect(() => {
        if (league) {
            setName(league.name);
            setVisibility(league.is_public ? 'public' : 'private');
            setMaxTeams(league.max_teams);
        }
    }, [league]);

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            // 1. Update Details
            const formData = new FormData();
            formData.append('name', name);
            formData.append('visibility', visibility);
            await updateLeagueDetails(league.id, formData);

            // 2. Update Max Teams if changed
            if (maxTeams !== league.max_teams) {
                await updateMaxTeams(league.id, maxTeams);
            }

            alert('All settings saved successfully!');
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateCode = async () => {
        if (!confirm('Are you sure? The old code will stop working immediately.')) return;
        setLoading(true);
        try {
            await regenerateLeagueCode(league.id);
            router.refresh(); // Refresh to show new code
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKick = async (teamId: string) => {
        if (!confirm('Kick this member? Their team will be deleted and spot opened.')) return;
        setLoading(true);
        try {
            await deleteTeam(league.id, teamId);
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBot = async () => {
        setLoading(true);
        try {
            await addPlaceholderTeam(league.id);
            alert('Bot team added!');
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartLeague = async () => {
        setLoading(true);
        try {
            await startLeague(league.id);
            alert('League started! Schedule and draft generated.');
            router.push(`/fantasy/leagues/${league.id}`);
            router.refresh();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleReset = async () => {
        if (!confirm('DANGEROUS: This will wipe specific schedule, draft, and rosters. Teams remain.\n\nType "RESET" to confirm.')) return;
        setLoading(true);
        try {
            await resetLeague(league.id);
            router.refresh();
            alert('League reset.');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-yellow-500 font-bold uppercase text-sm tracking-wider">Commissioner Tools</h3>
                <span className="text-xs text-yellow-500/50">Admin Access</span>
            </div>
            <div className="flex gap-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="text-sm font-bold text-gray-400 hover:text-white underline">
                            Advanced Settings
                        </button>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl max-h-[85vh] bg-black border border-white/10 text-white flex flex-col">
                        <div className="flex items-start justify-between pr-8">
                            <DialogHeader className="text-left">
                                <DialogTitle className="text-2xl font-black italic uppercase">Commissioner Settings</DialogTitle>
                                <DialogDescription>Manage your league configuration, teams, and schedule.</DialogDescription>
                            </DialogHeader>
                            <button
                                onClick={handleSaveChanges}
                                disabled={loading}
                                className="bg-white text-black font-black uppercase tracking-wider px-4 py-2 text-sm rounded hover:bg-gray-200 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>

                        <div className="space-y-12 mt-4 p-1 overflow-y-auto flex-1 pr-2">
                            {/* 1. LEAGUE SETTINGS */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-black italic uppercase text-white border-b border-white/10 pb-2">League Settings</h2>

                                <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 uppercase mb-2">League Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Visibility</label>
                                        <div className="flex gap-4">
                                            <label className={`flex-1 cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${visibility === 'private' ? 'bg-red-600/20 border-red-600 text-white' : 'bg-black/30 border-white/10 text-gray-400'}`}>
                                                <input type="radio" value="private" checked={visibility === 'private'} onChange={(e) => setVisibility(e.target.value)} className="hidden" />
                                                <Lock className="w-5 h-5" />
                                                <span className="font-bold">Private</span>
                                            </label>
                                            <label className={`flex-1 cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${visibility === 'public' ? 'bg-red-600/20 border-red-600 text-white' : 'bg-black/30 border-white/10 text-gray-400'}`}>
                                                <input type="radio" value="public" checked={visibility === 'public'} onChange={(e) => setVisibility(e.target.value)} className="hidden" />
                                                <Eye className="w-5 h-5" />
                                                <span className="font-bold">Public</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Invite Code */}
                                {visibility === 'private' && (
                                    <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-white uppercase mb-1">Invite Code</h3>
                                            <p className="text-sm text-gray-500">Share this code to let people join.</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-black/50 border border-white/20 rounded px-4 py-2 font-mono text-xl text-green-400 tracking-widest">
                                                {league.league_code}
                                            </div>
                                            <button
                                                onClick={handleRegenerateCode}
                                                disabled={loading}
                                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white uppercase font-bold"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                                Regenerate
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* 2. TEAM MANAGEMENT */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                    <h2 className="text-xl font-black italic uppercase text-white">Team Management</h2>
                                    {hasStarted && <span className="bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded">LOCKED (Season Started)</span>}
                                </div>

                                <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 space-y-8">
                                    {/* Max Teams */}
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <label className="block text-sm font-bold text-gray-400 uppercase">Max Teams</label>
                                            {!hasStarted && (
                                                <button
                                                    onClick={handleAddBot}
                                                    disabled={loading || teams.length >= maxTeams}
                                                    className="text-xs bg-green-900/30 text-green-500 hover:bg-green-900/50 px-3 py-1 rounded uppercase font-bold transition disabled:opacity-20 flex items-center gap-1"
                                                >
                                                    + Add CPU Team
                                                </button>
                                            )}
                                        </div>
                                        <select
                                            value={maxTeams}
                                            disabled={hasStarted || loading}
                                            onChange={(e) => setMaxTeams(parseInt(e.target.value))}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none disabled:opacity-50"
                                        >
                                            {[4, 6, 8, 10, 12, 14, 16].map(num => (
                                                <option key={num} value={num}>{num} Teams</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-2">Cannot be lower than current team count. (Changes saved on "Save Settings")</p>
                                    </div>

                                    {/* Kick Teams */}
                                    <div>
                                        <div className="space-y-2">
                                            {teams.map((team) => (
                                                <div key={team.id} className="flex items-center justify-between bg-black/30 p-3 rounded border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${team.is_claimed ? 'bg-green-500' : 'bg-gray-600'}`} />
                                                        <div>
                                                            <div className="font-bold text-white">{team.name}</div>
                                                        </div>
                                                    </div>
                                                    {team.is_claimed && !hasStarted && (
                                                        <button
                                                            onClick={() => handleKick(team.id)}
                                                            disabled={loading || team.user_id === userId} // Can't kick self easily here
                                                            className="text-xs bg-red-900/30 text-red-500 hover:bg-red-900/50 px-3 py-1 rounded uppercase font-bold transition disabled:opacity-20"
                                                        >
                                                            KICK
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 3. SEASON CONTROL */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-black italic uppercase text-white border-b border-white/10 pb-2">Season Control</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Start League */}
                                    {!hasStarted && (
                                        <div className="bg-green-900/10 border border-green-500/20 rounded-xl p-6">
                                            <h3 className="text-green-500 font-bold uppercase mb-2">Start League</h3>
                                            <p className="text-sm text-green-200/50 mb-6">Generates schedule and runs draft. Requires at least 2 teams.</p>
                                            <button
                                                onClick={handleStartLeague}
                                                disabled={loading}
                                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded uppercase tracking-wide"
                                            >
                                                Start League
                                            </button>
                                        </div>
                                    )}

                                    {/* Reset League */}
                                    <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-6">
                                        <h3 className="text-red-500 font-bold uppercase mb-2 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5" />
                                            Reset League
                                        </h3>
                                        <p className="text-sm text-red-200/50 mb-6">Dangerous. Wipes schedule, draft, and rosters. Teams remain.</p>
                                        <button
                                            onClick={handleReset}
                                            disabled={loading}
                                            className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-500 font-bold py-3 rounded uppercase tracking-wide border border-red-600/50"
                                        >
                                            Reset League
                                        </button>
                                    </div>

                                    {/* Archive League */}
                                    <form action={async () => {
                                        if (!confirm('Archive this league? It will be read-only and code freed up.')) return;
                                        await archiveLeague(league.id);
                                    }} className="bg-neutral-900 border border-white/10 rounded-xl p-6">
                                        <h3 className="text-gray-300 font-bold uppercase mb-2 flex items-center gap-2">
                                            <Archive className="w-5 h-5" />
                                            Archive League
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-6">Soft delete. Clean up your dashboard.</p>
                                        <button type="submit" className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold py-3 rounded uppercase tracking-wide">
                                            Archive League
                                        </button>
                                    </form>

                                    {/* Delete League */}
                                    <form action={async () => {
                                        if (!confirm('DELETE FOREVER? This cannot be undone.')) return;
                                        await deleteLeague(league.id);
                                    }} className="bg-neutral-900 border border-white/10 rounded-xl p-6 opacity-50 hover:opacity-100 transition">
                                        <h3 className="text-gray-500 font-bold uppercase mb-2 flex items-center gap-2">
                                            <Trash2 className="w-5 h-5" />
                                            Delete League
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-6">Permanently remove details and history.</p>
                                        <button type="submit" className="w-full bg-black border border-neutral-800 text-gray-500 hover:text-red-600 hover:border-red-900 font-bold py-3 rounded uppercase tracking-wide">
                                            Delete Forever
                                        </button>
                                    </form>
                                </div>
                            </section>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
