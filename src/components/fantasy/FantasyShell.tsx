import Link from 'next/link';

import SignOutButton from '@/app/admin/SignOutButton';

export function FantasyNav({ user }: { user: any }) {
    return (
        <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="container mx-auto px-4 flex items-center h-14 space-x-6 text-sm font-medium">
                <Link href="/fantasy" className="text-gray-100 hover:text-white transition">
                    Fantasy Hub
                </Link>
                <Link href="/fantasy/create" className="text-gray-400 hover:text-white transition">
                    Create League
                </Link>
                <div className="flex-1" />
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400">
                            {user.email}
                        </span>
                        <div className="w-px h-4 bg-gray-700" />
                        <SignOutButton />
                    </div>
                ) : (
                    <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400 transition">
                        Login / Sign Up
                    </Link>
                )}
            </div>
        </nav>
    );
}

import { createClient } from '@/lib/supabase-server';

export default async function FantasyShell({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-red-900/50">
            <FantasyNav user={user} />
            {children}
        </div>
    );
}
