'use client'

import { useState } from 'react'
import { createArticle, updateArticle, deleteArticle } from './actions'
import { Loader2, Plus, Pencil, Trash2, Save, X, ImageIcon, Link as LinkIcon, Calendar } from 'lucide-react'

interface Article {
    id: string
    title: string
    summary?: string
    content?: string
    image_url?: string
    category: string
    published_at: string
    link?: string
}

export default function NewsList({ initialArticles }: { initialArticles: Article[] }) {
    const [articles, setArticles] = useState<Article[]>(initialArticles)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form data
    const [formData, setFormData] = useState<Partial<Article>>({
        title: '',
        summary: '',
        content: '',
        category: 'Team News',
        image_url: '',
        link: '',
        published_at: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    })

    const handleEdit = (article: Article) => {
        setEditingId(article.id)
        setFormData({
            title: article.title,
            summary: article.summary || '',
            content: article.content || '',
            category: article.category,
            image_url: article.image_url || '',
            link: article.link || '',
            published_at: article.published_at.split('T')[0]
        })
        setIsAdding(false)
    }

    const resetForm = () => {
        setEditingId(null)
        setIsAdding(false)
        setFormData({
            title: '', summary: '', content: '', category: 'Team News',
            image_url: '', link: '', published_at: new Date().toISOString().split('T')[0]
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const submitData = new FormData()
        submitData.append('title', formData.title!)
        if (formData.summary) submitData.append('summary', formData.summary)
        if (formData.content) submitData.append('content', formData.content)
        if (formData.category) submitData.append('category', formData.category)
        if (formData.image_url) submitData.append('image_url', formData.image_url)
        if (formData.link) submitData.append('link', formData.link)
        if (formData.published_at) submitData.append('published_at', formData.published_at)

        try {
            if (isAdding) {
                await createArticle(submitData)
            } else if (editingId) {
                await updateArticle(editingId, submitData)
            }
            window.location.reload()
        } catch (err) {
            alert('Error saving article')
        } finally {
            setLoading(false)
            resetForm()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return
        setLoading(true)
        try {
            await deleteArticle(id)
            window.location.reload()
        } catch (err) {
            alert('Error deleting article')
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">News Articles</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-black font-bold rounded hover:bg-secondary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Post Article
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {/* Add/Edit Form Overlay or Inline - Using Inline for simplicity */}
                {isAdding && (
                    <form onSubmit={handleSubmit} className="bg-white/10 p-6 rounded-lg border border-secondary/50 space-y-4">
                        <h3 className="font-bold text-lg text-white mb-4">New Article</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Title</label>
                                <input
                                    required
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white font-bold"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Stallions Win Championship..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Category</label>
                                <select
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Team News">Team News</option>
                                    <option value="Game Recap">Game Recap</option>
                                    <option value="Roster Move">Roster Move</option>
                                    <option value="Community">Community</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Publish Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                    value={formData.published_at}
                                    onChange={e => setFormData({ ...formData, published_at: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Summary (Snippet)</label>
                                <textarea
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white h-20"
                                    value={formData.summary}
                                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                    placeholder="Brief description for the home page card..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-1">Image URL</label>
                                <input
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-1">External Link (Optional)</label>
                                <input
                                    className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                    value={formData.link}
                                    onChange={e => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="https://FOXSports.com/..."
                                />
                            </div>
                            {/* Content field omitted for MVP if just linking out, but keeping in DB just in case */}
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={resetForm} className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-600">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Publish
                            </button>
                        </div>
                    </form>
                )}

                {/* Existing Articles */}
                {articles.map(article => (
                    <div key={article.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex gap-4">
                        {editingId === article.id ? (
                            <form onSubmit={handleSubmit} className="w-full space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <input
                                            className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white font-bold"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Title"
                                        />
                                    </div>
                                    <select
                                        className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Team News">Team News</option>
                                        <option value="Game Recap">Game Recap</option>
                                        <option value="Roster Move">Roster Move</option>
                                        <option value="Community">Community</option>
                                    </select>
                                    <input
                                        type="date"
                                        className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                        value={formData.published_at}
                                        onChange={e => setFormData({ ...formData, published_at: e.target.value })}
                                    />
                                    <div className="md:col-span-2">
                                        <textarea
                                            className="w-full bg-black/50 border border-white/20 rounded px-3 py-2 text-white h-20"
                                            value={formData.summary}
                                            onChange={e => setFormData({ ...formData, summary: e.target.value })}
                                            placeholder="Summary"
                                        />
                                    </div>
                                    <input
                                        className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="Image URL"
                                    />
                                    <input
                                        className="bg-black/50 border border-white/20 rounded px-3 py-2 text-white"
                                        value={formData.link}
                                        onChange={e => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="External Link"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={resetForm} className="p-2 text-neutral-400 hover:text-white"><X className="w-4 h-4" /></button>
                                    <button type="submit" disabled={loading} className="p-2 bg-green-600 text-white rounded"><Save className="w-4 h-4" /></button>
                                </div>
                            </form>
                        ) : (
                            <>
                                {/* Thumbnail */}
                                <div className="w-24 h-24 bg-white/10 rounded flex items-center justify-center overflow-hidden shrink-0">
                                    {article.image_url ? (
                                        <img src={article.image_url} alt="" className="object-cover w-full h-full" />
                                    ) : (
                                        <ImageIcon className="text-white/20 w-8 h-8" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] bg-secondary/20 text-secondary font-bold px-2 py-0.5 rounded uppercase">
                                            {article.category}
                                        </span>
                                        <span className="text-xs text-neutral-500 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(article.published_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-white text-lg leading-tight mb-2">{article.title}</h3>
                                    <p className="text-sm text-neutral-400 line-clamp-2">{article.summary}</p>
                                    {article.link && (
                                        <div className="mt-2 flex items-center text-xs text-blue-400">
                                            <LinkIcon className="w-3 h-3 mr-1" /> External Link
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button onClick={() => handleEdit(article)} className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(article.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded">
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
