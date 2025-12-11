import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Check if we are on the admin subdomain
    // Supports both production (admin.bhamstallions.com) and local dev (admin.localhost:3000)
    const isAdminSubdomain = hostname.startsWith('admin.');

    // 1. Handle Admin Subdomain
    if (isAdminSubdomain) {
        // Prevent rewriting for static files and Next.js internals handled by matcher, 
        // but good to double check if something slips through.

        // Exclude /login and /auth from rewrite so we use the shared login page
        // This allows admin.localhost:3000/login to work
        if (url.pathname.startsWith('/login') || url.pathname.startsWith('/auth')) {
            return NextResponse.next();
        }

        // Rewrite logic:
        // admin.domain.com/ -> serves /admin
        // admin.domain.com/fantasy -> serves /admin/fantasy

        // We replace the path with /admin prefix
        const newUrl = new URL(`/admin${url.pathname}`, request.url);
        newUrl.search = url.search; // Preserve query params

        // Note: We don't redirect (change URL in browser), we rewrite (show content from different path)
        return NextResponse.rewrite(newUrl);
    }

    // 2. Handle Main Domain trying to access /admin directly
    // We want to block access to bhamstallions.com/admin so it appears it doesn't exist
    if (url.pathname.startsWith('/admin')) {
        // Return 404 Not Found
        return new NextResponse(null, { status: 404, statusText: "Not Found" });
    }

    // Continue for all other requests
    return NextResponse.next();
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
