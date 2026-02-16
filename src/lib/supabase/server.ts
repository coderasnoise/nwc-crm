import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _admin: SupabaseClient | null = null;

/**
 * Server-only Supabase admin client.
 *
 * Uses the **secret key** which bypasses RLS and must NEVER be exposed
 * to the client. The `server-only` import guarantees a build error if
 * this module is accidentally imported in a client component.
 */
export function getSupabaseAdmin() {
    if (_admin) return _admin;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
        throw new Error(
            'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY',
        );
    }

    _admin = createClient(url, key);
    return _admin;
}
