'use client'

import { useState } from 'react'
import { PlayerData, savePlayer, deletePlayer } from './actions'
import { Loader2, Plus, Edit2, Trash2, User, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'

export default function RosterList({ players }: { players: any[] }) {
    const [filter, setFilter] = useState('ALL')
    const [search, setSearch] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPlayer, setEditingPlayer] = useState<PlayerData | null>(null)
    const [saving, setSaving] = useState(false)

    const filteredPlayers = players.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.position.toLowerCase().includes(search.toLowerCase())
        if (!matchSearch) return false
        if (filter === 'ALL') return true
        return p.side_of_ball === filter
    })

    const handleCreate = () => {
        setEditingPlayer({
            name: '',
            number: '',
            position: '',
            height: '',
            weight: '',
            college: '',
            side_of_ball: 'OFFENSE',
            active: true
        } as any)
        setIsDialogOpen(true)
    }

    const handleEdit = (p: any) => {
        setEditingPlayer({
            id: p.id,
            name: p.name,
            number: p.number,
            position: p.position,
            height: p.height,
            weight: p.weight,
            college: p.college,
            image_url: p.image_url,
            bio: p.bio,
            side_of_ball: p.side_of_ball || 'OFFENSE', // Default fallback
            active: p.active !== false // Default true if null
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await savePlayer(editingPlayer!)
            setIsDialogOpen(false)
        } catch (e) {
            alert('Error saving player')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this player from the database?")) return
        await deletePlayer(id)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-900 border border-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search Name or Pos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-black/50 border-white/10 w-64"
                    />
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[180px] bg-black/50 border-white/10"><SelectValue placeholder="Filter" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Players</SelectItem>
                            <SelectItem value="OFFENSE">Offense</SelectItem>
                            <SelectItem value="DEFENSE">Defense</SelectItem>
                            <SelectItem value="SPECIAL_TEAMS">Special Teams</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-neutral-500 uppercase">{filteredPlayers.length} Players</span>
                    <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700 font-bold uppercase">
                        <Plus className="w-4 h-4 mr-2" /> Add Player
                    </Button>
                </div>
            </div>

            <div className="bg-neutral-900 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs uppercase font-bold text-neutral-500">
                        <tr>
                            <th className="px-6 py-4">Player</th>
                            <th className="px-6 py-4">Pos / #</th>
                            <th className="px-6 py-4">Unit</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredPlayers.map(player => (
                            <tr key={player.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white text-lg">{player.name}</div>
                                    <div className="text-xs text-neutral-500 uppercase tracking-wide">{player.college}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="border-white/20 text-white font-mono">{player.number}</Badge>
                                        <span className="font-bold text-neutral-300">{player.position}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant="secondary" className="text-[10px]">
                                        {player.side_of_ball?.replace('_', ' ') || 'UNKNOWN'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    {player.active ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-white" onClick={() => handleEdit(player)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-900 hover:text-red-500 hover:bg-red-900/10" onClick={() => handleDelete(player.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredPlayers.length === 0 && <div className="p-8 text-center text-neutral-500">No players found.</div>}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl bg-neutral-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">Manage Player</DialogTitle>
                    </DialogHeader>
                    {editingPlayer && (
                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            <div className="flex items-center justify-between bg-black/30 p-4 rounded border border-white/5">
                                <Label className="text-base font-bold text-white">Active Roster Status</Label>
                                <Switch checked={editingPlayer.active} onCheckedChange={c => setEditingPlayer({ ...editingPlayer, active: c })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={editingPlayer.name} onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })} className="bg-black/50 border-white/10" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>College</Label>
                                    <Input value={editingPlayer.college} onChange={e => setEditingPlayer({ ...editingPlayer, college: e.target.value })} className="bg-black/50 border-white/10" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Jersey #</Label>
                                    <Input value={editingPlayer.number} onChange={e => setEditingPlayer({ ...editingPlayer, number: e.target.value })} className="bg-black/50 border-white/10 font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <Input value={editingPlayer.position} onChange={e => setEditingPlayer({ ...editingPlayer, position: e.target.value })} className="bg-black/50 border-white/10 uppercase" placeholder="QB" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Side of Ball</Label>
                                    <Select value={editingPlayer.side_of_ball} onValueChange={v => setEditingPlayer({ ...editingPlayer, side_of_ball: v })}>
                                        <SelectTrigger className="bg-black/50 border-white/10"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OFFENSE">Offense</SelectItem>
                                            <SelectItem value="DEFENSE">Defense</SelectItem>
                                            <SelectItem value="SPECIAL_TEAMS">Special Teams</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Height</Label>
                                    <Input value={editingPlayer.height} onChange={e => setEditingPlayer({ ...editingPlayer, height: e.target.value })} className="bg-black/50 border-white/10" placeholder="6-2" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Weight</Label>
                                    <Input value={editingPlayer.weight} onChange={e => setEditingPlayer({ ...editingPlayer, weight: e.target.value })} className="bg-black/50 border-white/10" placeholder="220" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Image URL (Headshot)</Label>
                                <Input value={editingPlayer.image_url || ''} onChange={e => setEditingPlayer({ ...editingPlayer, image_url: e.target.value })} className="bg-black/50 border-white/10" />
                            </div>

                            <div className="space-y-2">
                                <Label>Bio (Optional)</Label>
                                <textarea
                                    value={editingPlayer.bio || ''}
                                    onChange={e => setEditingPlayer({ ...editingPlayer, bio: e.target.value })}
                                    className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                                />
                            </div>

                            <Button type="submit" disabled={saving} className="w-full bg-red-600 hover:bg-red-700 font-bold uppercase">
                                {saving ? <Loader2 className="animate-spin" /> : 'Save Player'}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
