'use client'

import { useState } from 'react'
import { createEvent, updateEvent, deleteEvent, reorderEvents } from './actions'
import { Loader2, Plus, Pencil, Trash2, Save, X, ArrowDownAZ } from 'lucide-react'

interface HistoryEvent {
    id: string
    year: string
    title: string
    description: string
    display_order: number
}

export default function HistoryList({ initialEvents }: { initialEvents: HistoryEvent[] }) {
    const [events, setEvents] = useState<HistoryEvent[]>(initialEvents)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form data
    const [formData, setFormData] = useState<Partial<HistoryEvent>>({
        year: '',
        title: '',
        description: '',
        display_order: 0
    })

    const handleEdit = (event: HistoryEvent) => {
        setEditingId(event.id)
        setFormData({
            year: event.year,
            title: event.title,
            description: event.description,
            display_order: event.display_order
        })
        setIsAdding(false)
    }

    const resetForm = () => {
        setEditingId(null)
        setIsAdding(false)
        setFormData({ year: '', title: '', description: '', display_order: 0 })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const submitData = new FormData()
        submitData.append('year', formData.year!)
        submitData.append('title', formData.title!)
        submitData.append('description', formData.description!)
        submitData.append('display_order', (formData.display_order || 0).toString())

        try {
            if (isAdding) {
                await createEvent(submitData)
            } else if (editingId) {
                await updateEvent(editingId, submitData)
            }
            window.location.reload()
        } catch (err) {
            alert('Error saving event')
        } finally {
            setLoading(false)
            resetForm()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return
        setLoading(true)
        try {
            await deleteEvent(id)
            window.location.reload()
        } catch (err) {
            alert('Error deleting event')
            setLoading(false)
        }
    }

    // Smart Auto-Sort Logic
    const handleAutoSort = async () => {
        if (!confirm('This will automatically reorder all events based on the year/date text. Continue?')) return;
        setLoading(true);

        const sortedEvents = [...events].sort((a, b) => {
            const parseYear = (str: string) => {
                if (str.toLowerCase().includes('future')) return 9999;
                const match = str.match(/\b(19|20)\d{2}\b/);
                return match ? parseInt(match[0]) : 9998;
            };
            return parseYear(a.year) - parseYear(b.year);
        });

        // Re-assign display orders
        const updates = sortedEvents.map((ev, i) => ({
            id: ev.id,
            display_order: i + 1
        }));

        try {
            await reorderEvents(updates);
            // Optimistic update
            setEvents(sortedEvents.map((ev, i) => ({ ...ev, display_order: i + 1 })));
        } catch (err) {
            console.error(err);
            alert('Failed to save sort order');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Timeline Events</h2>
                <div className="flex items-center gap-4">
                    {loading && <span className="text-sm text-neutral-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Saving...</span>}

                    <button
                        onClick={handleAutoSort}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-300 font-bold rounded hover:bg-neutral-700 transition-colors border border-white/10"
                        title="Sort chronologically by extracting year from text"
                    >
                        <ArrowDownAZ className="w-4 h-4" /> Auto Sort
                    </button>

                    <button
                        onClick={() => {
                            setIsAdding(true)
                            setFormData({ ...formData, display_order: events.length + 1 })
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-black font-bold rounded hover:bg-secondary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Event
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {/* Add Form */}
                {isAdding && (
                    <form onSubmit={handleSubmit} className="bg-white/10 p-4 rounded-lg border border-secondary/50 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Year</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white font-mono"
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                                    placeholder="2024"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Order</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white font-mono"
                                    value={formData.display_order}
                                    onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="md:col-span-8">
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Title</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white font-bold"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Championship Win"
                                />
                            </div>
                            <div className="md:col-span-12">
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Description</label>
                                <textarea
                                    required
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white h-24"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Story of the season..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={resetForm} className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Event
                            </button>
                        </div>
                    </form>
                )}

                {/* Existing Events */}
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-4 items-start"
                    >
                        {editingId === event.id ? (
                            <form onSubmit={handleSubmit} className="w-full space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-2">
                                        <input
                                            className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white font-mono"
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input
                                            type="number"
                                            className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white font-mono"
                                            value={formData.display_order}
                                            onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="md:col-span-8">
                                        <input
                                            className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white font-bold"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-12">
                                        <textarea
                                            className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white h-24"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={resetForm} className="p-2 text-neutral-400 hover:text-white"><X className="w-4 h-4" /></button>
                                    <button type="submit" disabled={loading} className="p-2 bg-green-600 text-white rounded"><Save className="w-4 h-4" /></button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="p-4 text-white/20 font-black text-5xl flex flex-col items-center justify-center select-none font-sans">
                                    <span>{event.display_order}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xl font-black text-secondary font-mono tracking-tighter">
                                            {event.year}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-white text-lg uppercase mb-2">{event.title}</h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed">{event.description}</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button onClick={() => handleEdit(event)} className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(event.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
