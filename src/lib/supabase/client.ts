import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser (client-side) Supabase client with cookie-based auth.
 *
 * Uses the **publishable key** which is safe to expose in client bundles.
 * Sessions are managed via cookies set by the middleware.
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
}
