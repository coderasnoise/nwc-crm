import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/** Routes that don't require authentication */
const PUBLIC_ROUTES = ['/login', '/api/health', '/api/webhooks'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes through without auth check
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        // Still refresh the session if cookies exist
        const { supabaseResponse } = await updateSession(request);
        return supabaseResponse;
    }

    // Protected routes — check for authenticated user
    const { user, supabaseResponse } = await updateSession(request);

    if (!user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
