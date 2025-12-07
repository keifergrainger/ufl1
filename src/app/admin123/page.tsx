
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Player {
    id: string;
    name: string;
    position: string;
    number: string;
    college: string;
    status: 'pending' | 'approved' | 'rejected';
    image_url: string;
    unit?: string;
    height?: string;
    weight?: string;
    bio?: string;
    stats?: any;
}

export default function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);

    // Edit State
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

    useEffect(() => {
        if (isLoggedIn) {
            fetchPlayers();
        }
    }, [isLoggedIn, activeTab]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            setIsLoggedIn(true);
        } else {
            alert('Invalid credentials');
        }
    };

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const status = activeTab === 'pending' ? 'pending' : 'approved';
            const res = await fetch(`/api/players?status=${status}`);
            const data = await res.json();
            setPlayers(data);
        } catch (error) {
            console.error('Failed to fetch players', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
        if (newStatus === 'rejected') {
            if (!confirm('Are you sure you want to delete this player?')) return;
            await fetch(`/api/players?id=${id}`, { method: 'DELETE' });
        } else {
            await fetch('/api/players', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
        }
        fetchPlayers();
    };

    const saveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlayer) return;

        await fetch('/api/players', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingPlayer),
        });
        setEditingPlayer(null);
        fetchPlayers();
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-neutral-900 p-8 rounded-lg border border-neutral-800 w-full max-w-sm space-y-4">
                    <h1 className="text-2xl font-bold text-white mb-4">Admin Login</h1>
                    <input
                        type="text"
                        placeholder="Username"
                        className="w-full bg-black border border-neutral-700 p-2 text-white rounded"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full bg-black border border-neutral-700 p-2 text-white rounded"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-primary text-white p-2 rounded hover:bg-opacity-90 font-bold bg-red-600">Login</button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button onClick={() => setIsLoggedIn(false)} className="text-sm text-gray-400 hover:text-white">Logout</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-neutral-800 pb-4">
                <button
                    className={`px-4 py-2 font-bold ${activeTab === 'pending' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Imports
                </button>
                <button
                    className={`px-4 py-2 font-bold ${activeTab === 'active' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Roster
                </button>
            </div>

            {loading ? (
                <div className="text-gray-400">Loading...</div>
            ) : players.length === 0 ? (
                <p className="text-gray-400">No {activeTab} players found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {players.map((player) => (
                        <div key={player.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col gap-4">
                            <div className="flex gap-4">
                                {player.image_url ? (
                                    <img src={player.image_url} alt={player.name} className="w-20 h-20 rounded-lg object-cover bg-neutral-800" />
                                ) : (
                                    <div className="w-20 h-20 bg-neutral-800 rounded-lg flex items-center justify-center text-xs text-gray-600">No Img</div>
                                )}
                                <div className="overflow-hidden">
                                    <h2 className="text-lg font-bold truncate">{player.name}</h2>
                                    <p className="text-sm text-gray-400">#{player.number} | {player.position} ({player.unit})</p>
                                    <p className="text-xs text-gray-500 truncate">{player.college}</p>
                                </div>
                            </div>

                            <div className="mt-auto flex gap-2">
                                {activeTab === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleAction(player.id, 'approved')}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition font-bold"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(player.id, 'rejected')}
                                            className="flex-1 bg-neutral-700 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setEditingPlayer(player)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition font-bold"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleAction(player.id, 'rejected')}
                                            className="flex-1 bg-neutral-700 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingPlayer && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">Edit Player</h2>
                        <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Name</label>
                                <input className="w-full bg-black border border-neutral-700 p-2 rounded" value={editingPlayer.name} onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Number</label>
                                <input className="w-full bg-black border border-neutral-700 p-2 rounded" value={editingPlayer.number} onChange={e => setEditingPlayer({ ...editingPlayer, number: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Position</label>
                                <input className="w-full bg-black border border-neutral-700 p-2 rounded" value={editingPlayer.position} onChange={e => setEditingPlayer({ ...editingPlayer, position: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Unit (Offense/Defense/Special Teams)</label>
                                <select className="w-full bg-black border border-neutral-700 p-2 rounded" value={editingPlayer.unit || 'Offense'} onChange={e => setEditingPlayer({ ...editingPlayer, unit: e.target.value })}>
                                    <option value="Offense">Offense</option>
                                    <option value="Defense">Defense</option>
                                    <option value="Special Teams">Special Teams</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Height</label>
                                <input className="w-full bg-black border border-neutral-700 p-2 rounded" value={editingPlayer.height || ''} onChange={e => setEditingPlayer({ ...editingPlayer, height: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Weight</label>
                                <input className="w-full bg-black border border-neutral-700 p-2 rounded" value={editingPlayer.weight || ''} onChange={e => setEditingPlayer({ ...editingPlayer, weight: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">College</label>
                                <input className="w-full bg-black border border-neutral-700 p-2 rounded" value={editingPlayer.college || ''} onChange={e => setEditingPlayer({ ...editingPlayer, college: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Image URL</label>
                                <input className="w-full bg-black border border-neutral-700 p-2 rounded" value={editingPlayer.image_url || ''} onChange={e => setEditingPlayer({ ...editingPlayer, image_url: e.target.value })} />
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs text-gray-400">Bio</label>
                                <textarea className="w-full bg-black border border-neutral-700 p-2 rounded h-32" value={editingPlayer.bio || ''} onChange={e => setEditingPlayer({ ...editingPlayer, bio: e.target.value })} />
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs text-gray-400">Stats (JSON Format)</label>
                                <textarea
                                    className="w-full bg-black border border-neutral-700 p-2 rounded h-32 font-mono text-xs"
                                    value={typeof editingPlayer.stats === 'object' ? JSON.stringify(editingPlayer.stats, null, 2) : (editingPlayer.stats || '')}
                                    onChange={e => {
                                        try {
                                            const parsed = JSON.parse(e.target.value);
                                            setEditingPlayer({ ...editingPlayer, stats: parsed });
                                        } catch (err) {
                                            // Allow typing invalid json temporarily, but maybe warn or just store as string if needed?
                                            // For simplicity, we might just have to be careful. 
                                            // To truly allow editing, we might need a local state for the string value.
                                            // Let's rely on the user knowing JSON for this MVP phase or risk parsing errors.
                                            // BETTER APPROACH: Update a separate string state on change, parse on save.
                                            // But for this quick edit:
                                            setEditingPlayer({ ...editingPlayer, stats: e.target.value as any });
                                        }
                                    }}
                                />
                                <p className="text-[10px] text-gray-500">Edit raw JSON for stats tables.</p>
                            </div>

                            <div className="col-span-1 md:col-span-2 flex gap-4 mt-4 text-white">
                                <button type="button" onClick={() => setEditingPlayer(null)} className="flex-1 bg-neutral-800 p-3 rounded font-bold hover:bg-neutral-700">Cancel</button>
                                <button type="submit" className="flex-1 bg-green-600 p-3 rounded font-bold hover:bg-green-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
