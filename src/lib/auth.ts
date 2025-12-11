import { SupabaseClient, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-server'; // Our server-component client creator
import { redirect } from 'next/navigation';

/**
 * Checks if the user is an admin based on the server-side environment whitelist.
 * @param user Supabase User object
 * @returns boolean
 */
export function isAdmin(user: User | null | undefined): boolean {
    if (!user || !user.email) return false;

    // 1. Check App Metadata (Future-proof for DB-based roles)
    if (user.app_metadata?.role === 'admin') return true;

    // 2. Check Environment Variable Whitelist
    const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
    const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase());

    // Fallback: hardcoded safety allowed defaults (development) if ENV not set
    // In production, please set ADMIN_EMAILS
    const devDefaults = ['admin@stallions.ufl', 'keifer@antigravity.ai'];

    const email = user.email.toLowerCase();

    if (adminEmails.includes(email)) return true;

    // Only use dev defaults if ENV is not set/empty
    if (adminEmailsEnv.length === 0 && devDefaults.includes(email)) return true;

    return false;
}

/**
 * Server-side helper to assert admin access.
 * Redirects or throws error if not authorized.
 * @param supabase Optional ready-to-use client
 */
export async function requireAdmin(supabaseClient?: SupabaseClient) {
    const supabase = supabaseClient || await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        // Not logged in
        return { authorized: false, user: null, redirect: '/login' };
    }

    if (!isAdmin(user)) {
        // Logged in but not admin
        return { authorized: false, user, redirect: '/' };
    }

    return { authorized: true, user, redirect: null };
}

/**
 * Same as requireAdmin but throws/redirects automatically.
 * Use in Page Components.
 */
export async function protectAdminRoute() {
    const { authorized, redirect: redirectPath } = await requireAdmin();
    if (!authorized && redirectPath) {
        redirect(redirectPath);
    }
}
