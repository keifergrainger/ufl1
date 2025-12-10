'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs font-bold uppercase text-red-500 hover:text-red-400 w-full"
        >
            <LogOut className="w-3 h-3" /> Sign Out
        </button>
    )
}
