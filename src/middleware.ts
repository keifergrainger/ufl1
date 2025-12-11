import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // 1. Initial Response (default to next)
    let response = NextResponse.next({
        request: { headers: request.headers }
    });

    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';
    const isAdminSubdomain = hostname.startsWith('admin.');

    // 2. Routing Logic (Subdomains)
    if (isAdminSubdomain) {
        // Exclude /login and /auth from rewrite
        if (!url.pathname.startsWith('/login') && !url.pathname.startsWith('/auth')) {
            const newUrl = new URL(`/admin${url.pathname}`, request.url);
            newUrl.search = url.search;
            response = NextResponse.rewrite(newUrl, {
                request: { headers: request.headers }
            });
        }
    } else if (url.pathname.startsWith('/admin')) {
        // Block direct access to /admin on main domain
        return new NextResponse(null, { status: 404, statusText: "Not Found" });
    }

    // 3. Supabase Session Management
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // IMPORTANT: precise call to getUser() refreshes the auth token
    await supabase.auth.getUser()

    return response
}

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
