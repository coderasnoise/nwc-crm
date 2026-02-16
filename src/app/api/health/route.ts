import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        const { error } = await supabaseAdmin
            .from('_health_check')
            .select('1')
            .limit(1)
            .maybeSingle();

        // If the table doesn't exist, that's fine — it still proves DB is reachable.
        if (error) {
            const msg = error.message ?? String(error);
            if (!msg.includes('does not exist') && !msg.includes('permission denied') && !msg.includes('Could not find the')) {
                return NextResponse.json(
                    { ok: false, error: msg },
                    { status: 500 },
                );
            }
        }

        return NextResponse.json(
            { ok: true, timestamp: new Date().toISOString() },
            { status: 200 },
        );
    } catch (err: unknown) {
        const message =
            err instanceof Error
                ? err.message
                : typeof err === 'object' && err !== null && 'message' in err
                    ? String((err as { message: unknown }).message)
                    : String(err);
        return NextResponse.json(
            { ok: false, error: message },
            { status: 500 },
        );
    }
}
