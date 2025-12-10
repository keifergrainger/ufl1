'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient() // Client-side client

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setError(error.message)
            } else {
                router.push('/admin')
                router.refresh()
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="mb-8">
                <Link href="/">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                            <img src="/logo.png" alt="Stallions Logo" className="object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-widest text-red-600 leading-none">BIRMINGHAM</span>
                            <span className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">STALLIONS</span>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-xl p-8 shadow-2xl">
                <h1 className="text-2xl font-black uppercase italic text-white mb-2 text-center">Admin Access</h1>
                <p className="text-neutral-400 text-center mb-6 text-sm">Sign in to manage team content.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-red-600 focus:outline-none transition-colors"
                            placeholder="coach@stallions.ufl"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-red-600 focus:outline-none transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-900/50 text-red-500 text-sm p-3 rounded text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider py-3 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? 'Signing In...' : 'Enter Locker Room'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-xs text-neutral-500 hover:text-white transition-colors uppercase font-bold tracking-widest">
                        ← Back to Site
                    </Link>
                </div>
            </div>
        </div>
    )
}
