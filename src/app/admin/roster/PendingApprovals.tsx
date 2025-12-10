'use client'

import { useState } from 'react'
import { PlayerData, approvePlayer, rejectPlayer, savePlayer } from './actions'
import { Check, X, Edit2, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PendingApprovals({ players }: { players: any[] }) {
    const [operating, setOperating] = useState<string | null>(null)
    const [editingPlayer, setEditingPlayer] = useState<PlayerData | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    if (!players || players.length === 0) return null

    const handleApprove = async (id: string) => {
        setOperating(id)
        try {
            await approvePlayer(id)
        } catch (e) {
            alert('Error approving')
        } finally {
            setOperating(null)
        }
    }

    const handleReject = async (id: string) => {
        if (!confirm('Reject and delete this imported player?')) return
        setOperating(id)
        try {
            await rejectPlayer(id)
        } catch (e) {
            alert('Error rejecting')
        } finally {
            setOperating(null)
        }
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
            side_of_ball: p.side_of_ball || 'OFFENSE',
            active: false // Keep inactive/pending
        })
        setIsDialogOpen(true)
    }

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            // savePlayer updates the record but does NOT change status to active automatically
            // which is exactly what we want here (edit before approve)
            await savePlayer(editingPlayer!)
            setIsDialogOpen(false)
        } catch (e) {
            alert('Error saving changes')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
                <AlertTriangle className="w-5 h-5" />
                <div className="font-bold uppercase tracking-wide">Pending Approvals ({players.length})</div>
            </div>

            <div className="grid gap-4">
                {players.map(player => (
                    <div key={player.id} className="bg-neutral-900/50 border border-yellow-500/30 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Avatar / Image */}
                            <div className="w-12 h-12 bg-black rounded-full overflow-hidden border border-white/10 shrink-0">
                                {player.image_url && <img src={player.image_url} alt={player.name} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{player.name}</h4>
                                <div className="text-sm text-neutral-400 flex items-center gap-2">
                                    <span className="font-mono bg-white/10 px-1.5 rounded">{player.number || '##'}</span>
                                    <span>{player.position}</span>
                                    <span className="text-white/20">•</span>
                                    <span>{player.college}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button
                                onClick={() => handleApprove(player.id)}
                                disabled={!!operating}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold uppercase"
                            >
                                {operating === player.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                Approve
                            </Button>

                            <Button variant="secondary" size="icon" onClick={() => handleEdit(player)} disabled={!!operating}>
                                <Edit2 className="w-4 h-4" />
                            </Button>

                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleReject(player.id)}
                                disabled={!!operating}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Dialog (Simplified version of RosterList dialog) */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl bg-neutral-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic uppercase">Edit Pending Player</DialogTitle>
                    </DialogHeader>
                    {editingPlayer && (
                        <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
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
                                    <Label>Number</Label>
                                    <Input value={editingPlayer.number} onChange={e => setEditingPlayer({ ...editingPlayer, number: e.target.value })} className="bg-black/50 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <Input value={editingPlayer.position} onChange={e => setEditingPlayer({ ...editingPlayer, position: e.target.value })} className="bg-black/50 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Side</Label>
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
                                    <Input value={editingPlayer.height} onChange={e => setEditingPlayer({ ...editingPlayer, height: e.target.value })} className="bg-black/50 border-white/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Weight</Label>
                                    <Input value={editingPlayer.weight} onChange={e => setEditingPlayer({ ...editingPlayer, weight: e.target.value })} className="bg-black/50 border-white/10" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input value={editingPlayer.image_url || ''} onChange={e => setEditingPlayer({ ...editingPlayer, image_url: e.target.value })} className="bg-black/50 border-white/10" />
                            </div>

                            <Button type="submit" disabled={saving} className="w-full bg-white text-black hover:bg-white/90 font-bold uppercase">
                                {saving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
