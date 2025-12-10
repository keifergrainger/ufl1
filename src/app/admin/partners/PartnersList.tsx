'use client'

import { useState } from 'react'
import { createPartner, updatePartner, deletePartner } from './actions'
import { Loader2, Plus, Pencil, Trash2, Save, X, ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface Partner {
    id: string
    name: string
    tier: 'Premier' | 'Official' | 'Supporting'
    logo_url?: string
    link?: string
}

export default function PartnersList({ initialPartners }: { initialPartners: Partner[] }) {
    const [partners, setPartners] = useState<Partner[]>(initialPartners)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form Stats
    const [formData, setFormData] = useState<Partial<Partner>>({
        name: '',
        tier: 'Supporting',
        logo_url: '',
        link: ''
    })

    const handleEdit = (partner: Partner) => {
        setEditingId(partner.id)
        setFormData({
            name: partner.name,
            tier: partner.tier,
            logo_url: partner.logo_url || '',
            link: partner.link || ''
        })
        setIsAdding(false)
    }

    const resetForm = () => {
        setEditingId(null)
        setIsAdding(false)
        setFormData({ name: '', tier: 'Supporting', logo_url: '', link: '' })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const submitData = new FormData()
        submitData.append('name', formData.name!)
        submitData.append('tier', formData.tier!)
        if (formData.logo_url) submitData.append('logo_url', formData.logo_url)
        if (formData.link) submitData.append('link', formData.link)

        try {
            if (isAdding) {
                await createPartner(submitData)
            } else if (editingId) {
                await updatePartner(editingId, submitData)
            }
            // Simple refresh logic (real app might use optimistic UI or router.refresh)
            window.location.reload()
        } catch (err) {
            alert('Error saving partner')
        } finally {
            setLoading(false)
            resetForm()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this partner?')) return
        setLoading(true)
        try {
            await deletePartner(id)
            window.location.reload()
        } catch (err) {
            alert('Error deleting partner')
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Partners Database</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-black font-bold rounded hover:bg-secondary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Partner
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {/* Add Form */}
                {isAdding && (
                    <form onSubmit={handleSubmit} className="bg-white/10 p-4 rounded-lg border border-secondary/50 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Name</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Tier</label>
                                <select
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                    value={formData.tier}
                                    onChange={e => setFormData({ ...formData, tier: e.target.value as any })}
                                >
                                    <option value="Premier">Premier</option>
                                    <option value="Official">Official</option>
                                    <option value="Supporting">Supporting</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Logo URL</label>
                                <input
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                    value={formData.logo_url}
                                    onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Website Link</label>
                                <input
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={resetForm} className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Partner
                            </button>
                        </div>
                    </form>
                )}

                {/* Existing Partners */}
                {partners.map(partner => (
                    <div key={partner.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4">
                        {editingId === partner.id ? (
                            <form onSubmit={handleSubmit} className="w-full space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <select
                                        className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                        value={formData.tier}
                                        onChange={e => setFormData({ ...formData, tier: e.target.value as any })}
                                    >
                                        <option value="Premier">Premier</option>
                                        <option value="Official">Official</option>
                                        <option value="Supporting">Supporting</option>
                                    </select>
                                    <input
                                        className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                        value={formData.logo_url}
                                        onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                        placeholder="Logo URL"
                                    />
                                    <input
                                        className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="Link"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={resetForm} className="p-2 text-neutral-400 hover:text-white"><X className="w-4 h-4" /></button>
                                    <button type="submit" disabled={loading} className="p-2 bg-green-600 text-white rounded"><Save className="w-4 h-4" /></button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-white/10 rounded flex items-center justify-center overflow-hidden relative shrink-0">
                                    {partner.logo_url ? (
                                        <img src={partner.logo_url} alt={partner.name} className="object-contain w-full h-full p-2" />
                                    ) : (
                                        <span className="text-xs text-white/30 font-bold">{partner.name.substring(0, 2)}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate">{partner.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${partner.tier === 'Premier' ? 'bg-amber-400/20 text-amber-400' :
                                                partner.tier === 'Official' ? 'bg-blue-400/20 text-blue-400' :
                                                    'bg-neutral-500/20 text-neutral-400'
                                            }`}>
                                            {partner.tier}
                                        </span>
                                        {partner.link && (
                                            <a href={partner.link} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-secondary">
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(partner)} className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(partner.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {partners.length === 0 && !isAdding && (
                    <div className="text-neutral-500 text-center py-12 bg-white/5 rounded-lg border border-dashed border-white/10">
                        No partners found. Add your first partner above.
                    </div>
                )}
            </div>
        </div>
    )
}
