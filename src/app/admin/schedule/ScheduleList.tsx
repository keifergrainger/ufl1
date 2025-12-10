'use client'

import { useState } from 'react'
import { GameData, saveGame, deleteGame } from './actions'
import { Loader2, Plus, Edit2, Trash2, Calendar, MapPin, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ScheduleList({ games, timezone }: { games: any[], timezone: string }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingGame, setEditingGame] = useState<GameData | null>(null)
    const [saving, setSaving] = useState(false)

    // Helper: Convert "2026-03-30" "14:00" + "America/Chicago" -> ISO UTC String
    const getIsoFromWallTime = (dateStr: string, timeStr: string, tz: string) => {
        if (!dateStr || !timeStr) return undefined;

        // Initial guess: treat input as UTC
        let utcGuess = new Date(`${dateStr}T${timeStr}:00Z`);

        // Get the "wall time" parts of this guess in the target TZ
        // We use Intl to extract specific parts to avoid format confusion
        const parts = new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
            timeZone: tz
        }).formatToParts(utcGuess);

        const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0');

        // Reconstruct the "Wall Time" date object (as if it were UTC)
        const wallDateInUtc = new Date(Date.UTC(
            getPart('year'),
            getPart('month') - 1,
            getPart('day'),
            getPart('hour'),
            getPart('minute'),
            getPart('second')
        ));

        // Calculate discrepancy
        const diff = utcGuess.getTime() - wallDateInUtc.getTime();

        // Apply correction
        const corrected = new Date(utcGuess.getTime() + diff);
        return corrected.toISOString();
    };

    // Helper: Convert ISO -> "YYYY-MM-DD" and "HH:mm" in Target Timezone
    const getWallTimeFromIso = (iso: string, tz: string) => {
        const d = new Date(iso);
        // Use Intl to format to target timezone
        const parts = new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
            hour12: false,
            timeZone: tz
        }).formatToParts(d);

        const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

        const dateStr = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
        const timeStr = `${getPart('hour')}:${getPart('minute')}`;

        return { dateStr, timeStr };
    };

    const handleEdit = (game: any) => {
        setEditingGame({
            id: game.id,
            week: game.week,
            opponent: game.opponent,
            opponent_logo: game.opponent_logo,
            date_display: game.date_display,
            time_display: game.time_display,
            kickoff_timestamp: game.kickoff_timestamp,
            venue: game.venue,
            is_home: game.is_home,
            result: game.result,
            score_home: game.score_home,
            score_away: game.score_away,
            broadcaster: game.broadcaster,
            ticket_url: game.ticket_url
        })
        setIsDialogOpen(true)
    }

    const handleCreate = () => {
        setEditingGame({
            week: (games.length || 0) + 1,
            opponent: '',
            date_display: 'TBD',
            time_display: 'TBD',
            venue: 'Protective Stadium',
            is_home: true,
        } as any)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this game?')) return
        await deleteGame(id)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await saveGame(editingGame!)
            setIsDialogOpen(false)
        } catch (err) {
            alert('Failed to save')
        } finally {
            setSaving(false)
        }
    }

    // Compute wall values for the form
    const wallValues = editingGame?.kickoff_timestamp
        ? getWallTimeFromIso(editingGame.kickoff_timestamp, timezone)
        : { dateStr: '', timeStr: '19:00' };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-neutral-900 border border-white/5 p-4 rounded-xl">
                <div className="text-neutral-400 text-sm font-bold uppercase tracking-wider">{games.length} Games Scheduled <span className='text-xs text-neutral-600'>({timezone})</span></div>
                <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700 font-bold uppercase">
                    <Plus className="w-4 h-4 mr-2" /> Add Game
                </Button>
            </div>

            <div className="grid gap-4">
                {games.map((game) => (
                    <div key={game.id} className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 hover:border-white/10 transition-colors">
                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-[10px] items-center font-bold uppercase text-neutral-500">Week</span>
                            <span className="text-2xl font-black text-white">{game.week}</span>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-black italic text-white uppercase tracking-tight flex items-center gap-2 justify-center md:justify-start">
                                {game.is_home ? <span className="text-neutral-500 text-sm not-italic font-bold">vs</span> : <span className="text-neutral-500 text-sm not-italic font-bold">@</span>}
                                {game.opponent}
                            </h3>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-neutral-400">
                                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {game.date_display} • {game.time_display}</div>
                                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {game.venue}</div>
                                {game.broadcaster && <div className="flex items-center gap-1.5"><Tv className="w-3.5 h-3.5" /> {game.broadcaster}</div>}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-lg border border-white/5 min-w-[140px] justify-center">
                            {game.result ? (
                                <div className="text-center">
                                    <div className={`text-2xl font-black ${game.result === 'W' ? 'text-green-500' : game.result === 'L' ? 'text-red-500' : 'text-yellow-500'}`}>
                                        {game.result}
                                    </div>
                                    <div className="text-xs font-mono text-white/60">{game.score_home || 0} - {game.score_away || 0}</div>
                                </div>
                            ) : (
                                <span className="text-xs font-bold uppercase text-neutral-600 tracking-wider">Upcoming</span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(game)} className="h-10 w-10 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"><Edit2 className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(game.id)} className="h-10 w-10 p-0 text-red-500 hover:text-red-400 hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl bg-neutral-900 border border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">
                            {editingGame?.id ? 'Edit Game' : 'Schedule Game'}
                        </DialogTitle>
                    </DialogHeader>

                    {editingGame && (
                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Week #</Label>
                                    <Input type="number" value={editingGame.week} onChange={e => setEditingGame({ ...editingGame, week: parseInt(e.target.value) })} className="bg-black/50 border-white/10" />
                                </div>
                                <div className="space-y-2 flex flex-col justify-end pb-2">
                                    <div className="flex items-center gap-3 bg-black/50 p-2.5 rounded border border-white/10">
                                        <Label className="cursor-pointer flex-1">Is Home Game?</Label>
                                        <Switch checked={editingGame.is_home} onCheckedChange={c => setEditingGame({ ...editingGame, is_home: c })} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Opponent Name</Label>
                                <Input value={editingGame.opponent} onChange={e => setEditingGame({ ...editingGame, opponent: e.target.value })} className="bg-black/50 border-white/10" placeholder="e.g. Memphis Showboats" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-lg border border-white/5">
                                <div className="space-y-2">
                                    <Label className="text-secondary font-bold">Game Date ({timezone})</Label>
                                    <Input
                                        type="date"
                                        className="bg-black/50 border-white/10"
                                        value={wallValues.dateStr}
                                        onChange={(e) => {
                                            const newDateStr = e.target.value;
                                            if (!newDateStr) return;

                                            // Keep existing time or default
                                            const newTimeStr = wallValues.timeStr || "19:00";

                                            // Compute new ISO
                                            const newIso = getIsoFromWallTime(newDateStr, newTimeStr, timezone);
                                            if (!newIso) return;

                                            // Format Display Date
                                            const dObj = new Date(newIso);
                                            const dateDisplay = dObj.toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric', timeZone: timezone
                                            });

                                            setEditingGame({
                                                ...editingGame,
                                                date_display: dateDisplay,
                                                kickoff_timestamp: newIso
                                            });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-secondary font-bold">Kickoff Time ({timezone})</Label>
                                    <Input
                                        type="time"
                                        className="bg-black/50 border-white/10"
                                        value={wallValues.timeStr}
                                        onChange={(e) => {
                                            const newTimeStr = e.target.value;
                                            if (!newTimeStr) return;

                                            // Keep existing date or default to today
                                            const newDateStr = wallValues.dateStr || new Date().toISOString().split('T')[0];

                                            // Compute new ISO
                                            const newIso = getIsoFromWallTime(newDateStr, newTimeStr, timezone);
                                            if (!newIso) return;

                                            // Format Display Time
                                            const dObj = new Date(newIso);
                                            const timeDisplay = dObj.toLocaleTimeString('en-US', {
                                                hour: 'numeric', minute: '2-digit', timeZone: timezone
                                            });

                                            setEditingGame({
                                                ...editingGame,
                                                time_display: timeDisplay,
                                                kickoff_timestamp: newIso
                                            });
                                        }}
                                    />
                                </div>
                                <div className="col-span-2 text-xs text-neutral-500 font-mono flex gap-4">
                                    <span>Display: {editingGame.date_display || '---'}</span>
                                    <span>Time: {editingGame.time_display || '---'}</span>
                                    <span className="text-neutral-700 block mt-1">ISO: {editingGame.kickoff_timestamp}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Venue</Label>
                                    <Input value={editingGame.venue} onChange={e => setEditingGame({ ...editingGame, venue: e.target.value })} className="bg-black/50 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Broadcaster</Label>
                                    <Select value={editingGame.broadcaster || ''} onValueChange={v => setEditingGame({ ...editingGame, broadcaster: v })}>
                                        <SelectTrigger className="bg-black/50 border-white/10"><SelectValue placeholder="Select Network" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FOX">FOX</SelectItem>
                                            <SelectItem value="ABC">ABC</SelectItem>
                                            <SelectItem value="ESPN">ESPN</SelectItem>
                                            <SelectItem value="ESPN2">ESPN2</SelectItem>
                                            <SelectItem value="NBC">NBC</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <Label className="text-neutral-500 uppercase text-xs font-bold mb-3 block">Game Result (Post-Game)</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Result</Label>
                                        <Select value={editingGame.result || 'pending'} onValueChange={v => setEditingGame({ ...editingGame, result: v === 'pending' ? undefined : v })}>
                                            <SelectTrigger className="bg-black/50 border-white/10"><SelectValue placeholder="Pending" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="W">Win</SelectItem>
                                                <SelectItem value="L">Loss</SelectItem>
                                                <SelectItem value="T">Tie</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Home Score</Label>
                                        <Input type="number" value={editingGame.score_home ?? ''} onChange={e => setEditingGame({ ...editingGame, score_home: parseInt(e.target.value) })} className="bg-black/50 border-white/10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Away Score</Label>
                                        <Input type="number" value={editingGame.score_away ?? ''} onChange={e => setEditingGame({ ...editingGame, score_away: parseInt(e.target.value) })} className="bg-black/50 border-white/10" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Ticket URL</Label>
                                <Input value={editingGame.ticket_url || ''} onChange={e => setEditingGame({ ...editingGame, ticket_url: e.target.value })} className="bg-black/50 border-white/10" placeholder="https://..." />
                            </div>

                            <Button type="submit" disabled={saving} className="w-full bg-red-600 hover:bg-red-700 font-bold uppercase mt-4">
                                {saving ? <Loader2 className="animate-spin" /> : 'Save Game Details'}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
