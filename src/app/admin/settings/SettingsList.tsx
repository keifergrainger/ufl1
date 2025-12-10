'use client'

import { useState } from 'react'
import { updateSetting } from './actions'
import { Loader2, Check, X, Edit2 } from 'lucide-react'

interface Setting {
    id: string
    key: string
    value: string
    description?: string
    type: string
}

export default function SettingsList({ settings }: { settings: Setting[] }) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')
    const [saving, setSaving] = useState(false)

    const startEdit = (setting: Setting) => {
        setEditingId(setting.id)
        setEditValue(setting.value)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditValue('')
    }

    const save = async (key: string) => {
        setSaving(true)
        try {
            await updateSetting(key, editValue)
            setEditingId(null)
        } catch (e) {
            alert('Failed to save')
        } finally {
            setSaving(false)
        }
    }

    return (
        <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase font-bold text-neutral-500">
                <tr>
                    <th className="px-6 py-4">Key / Description</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {settings.map((setting) => (
                    <tr key={setting.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                            <div className="font-mono text-sm text-red-400 mb-1">{setting.key}</div>
                            <div className="text-xs text-neutral-500">{setting.description}</div>
                        </td>
                        <td className="px-6 py-4">
                            {editingId === setting.id ? (
                                <input
                                    className="bg-black border border-white/20 rounded px-3 py-2 w-full text-white focus:border-red-500 outline-none"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                <div className="text-white font-medium max-w-md truncate" title={setting.value}>
                                    {setting.value}
                                </div>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                            {editingId === setting.id ? (
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => save(setting.key)}
                                        disabled={saving}
                                        className="p-2 bg-green-600 rounded hover:bg-green-700 text-white disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        disabled={saving}
                                        className="p-2 bg-neutral-700 rounded hover:bg-neutral-600 text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => startEdit(setting)}
                                    className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
