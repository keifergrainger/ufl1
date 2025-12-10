'use client'

import { useState } from 'react'
import { CoachData, saveCoach, deleteCoach } from './actions'
import { Loader2, Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function CoachesList({ coaches }: { coaches: any[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCoach, setEditingCoach] = useState<CoachData | null>(null)
    const [saving, setSaving] = useState(false)

    const handleCreate = () => {
        setEditingCoach({
            name: '',
            role: '',
            sort_order: (coaches.length + 1) * 10
        } as any)
        setIsDialogOpen(true)
    }

    const handleEdit = (c: any) => {
        setEditingCoach({
            id: c.id,
            name: c.name,
            role: c.role,
            headshot_url: c.headshot_url,
            bio_short: c.bio_short,
            tagline: c.tagline,
            sort_order: c.sort_order || 99
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await saveCoach(editingCoach!)
            setIsDialogOpen(false)
        } catch (e) {
            alert('Error saving coach')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this coach?")) return
        await deleteCoach(id)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-neutral-900 border border-white/5 p-4 rounded-xl">
                <div className="text-neutral-400 text-sm font-bold uppercase tracking-wider">{coaches.length} Staff Members</div>
                <Button onClick={handleCreate} className="bg-red-600 hover:bg-red-700 font-bold uppercase">
                    <Plus className="w-4 h-4 mr-2" /> Add Coach
                </Button>
            </div>

            <div className="grid gap-4">
                {coaches.map((coach) => (
                    <div key={coach.id} className="bg-neutral-900/50 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors">
                        <div className="text-neutral-600 cursor-move"><GripVertical className="w-5 h-5" /></div>

                        <Avatar className="h-12 w-12 border border-white/10">
                            <AvatarImage src={coach.headshot_url} alt={coach.name} className="object-cover" />
                            <AvatarFallback className="bg-neutral-800 text-neutral-400 text-xs font-bold">
                                {coach.name.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <h3 className="text-lg font-black text-white uppercase italic">{coach.name}</h3>
                            <div className="text-sm font-bold text-red-500 uppercase tracking-widest">{coach.role}</div>
                        </div>

                        <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-white" onClick={() => handleEdit(coach)}>
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-900 hover:text-red-500 hover:bg-red-900/10" onClick={() => handleDelete(coach.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-xl bg-neutral-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">Manage Coach</DialogTitle>
                    </DialogHeader>
                    {editingCoach && (
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={editingCoach.name} onChange={e => setEditingCoach({ ...editingCoach, name: e.target.value })} className="bg-black/50 border-white/10" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Role / Title</Label>
                                <Input value={editingCoach.role} onChange={e => setEditingCoach({ ...editingCoach, role: e.target.value })} className="bg-black/50 border-white/10" placeholder="e.g. Head Coach" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Headshot URL</Label>
                                <Input value={editingCoach.headshot_url || ''} onChange={e => setEditingCoach({ ...editingCoach, headshot_url: e.target.value })} className="bg-black/50 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Tagline / Motto</Label>
                                <Input value={editingCoach.tagline || ''} onChange={e => setEditingCoach({ ...editingCoach, tagline: e.target.value })} className="bg-black/50 border-white/10" placeholder="e.g. Built Birmingham Tough" />
                            </div>
                            <div className="space-y-2">
                                <Label>Ordering (Lower = Higher)</Label>
                                <Input type="number" value={editingCoach.sort_order} onChange={e => setEditingCoach({ ...editingCoach, sort_order: parseInt(e.target.value) })} className="bg-black/50 border-white/10" />
                            </div>

                            <Button type="submit" disabled={saving} className="w-full bg-red-600 hover:bg-red-700 font-bold uppercase mt-2">
                                {saving ? <Loader2 className="animate-spin" /> : 'Save Staff Member'}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
