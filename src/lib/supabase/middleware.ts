import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Creates a Supabase client scoped to the middleware request/response
 * lifecycle. Handles session refresh by reading and writing cookies
 * on the forwarded response.
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Set on the request so downstream server code sees them
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    // Create a new response carrying the updated cookies
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // Refresh the session — IMPORTANT: do not use getSession() here.
    // getUser() hits the Supabase Auth server and validates the JWT.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return { user, supabaseResponse };
}
