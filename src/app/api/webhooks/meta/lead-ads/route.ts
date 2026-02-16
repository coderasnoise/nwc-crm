import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { LEAD_STAGES } from '@/lib/constants';

// Environment variables
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
// const APP_SECRET = process.env.META_APP_SECRET; // For HMAC verification (TODO)

interface LeadPayload {
    email?: string;
    phone?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    description?: string; // e.g. "I want a hair transplant"
    // Add other fields as needed based on your Lead Ad form
}

/**
 * GET Handler - Webhook Verification
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // basic verification
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[Webhook] Verified.');
        return new NextResponse(challenge, { status: 200 });
    }

    console.error('[Webhook] Verification failed.', { mode, token, expected: VERIFY_TOKEN });
    return new NextResponse('Forbidden', { status: 403 });
}

/**
 * POST Handler - Review Lead Data
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('[Webhook] Received payload:', JSON.stringify(body, null, 2));

        // 1. Extract Lead Info
        // Note: Standard Meta Webhooks send a notification with `leadgen_id`.
        // They DO NOT send PII directly unless you use the Graph API to fetch it.
        // However, if this endpoint is being hit by a custom integrator (Zapier/Make)
        // that pushes the *data*, we can process it directly.
        // We assume the body *contains* the data for this MVP.
        // If the body follows the standard "entry" format, we log it and return 200 (to satisfy Meta),
        // but we can't create a lead without fetching.

        // We check for direct data first (Zapier style)
        let leadData: LeadPayload = {
            email: body.email,
            phone: body.phone,
            first_name: body.first_name,
            last_name: body.last_name,
            full_name: body.full_name,
        };

        // If not flat, check for nested (Make/Zapier wrapper?)
        // If standard Meta notification:
        if (body.object === 'page' && body.entry) {
            console.log('[Webhook] Received Meta Notification. Lead retrieval via Graph API is required.');
            // For MVP, we acknowledge receiving it.
            // TODO: Implement Graph API fetch using `leadgen_id` from `body.entry[0].changes[0].value.leadgen_id`
            // Requires SYSTEM_USER_ACCESS_TOKEN.
            return NextResponse.json({ success: true, message: 'Notification received.' });
        }

        // Validate basic requirement for upsert
        if (!leadData.email && !leadData.phone) {
            console.warn('[Webhook] No email or phone provided. Cannot upsert.');
            return NextResponse.json({ error: 'Missing email or phone' }, { status: 400 });
        }

        // Normalize data
        // Split full_name if first/last missing
        if (!leadData.first_name && leadData.full_name) {
            const parts = leadData.full_name.trim().split(' ');
            leadData.first_name = parts[0];
            leadData.last_name = parts.slice(1).join(' ') || '';
        }

        // 2. Database Upsert
        const admin = getSupabaseAdmin();

        // Check for existing lead
        let query = admin.from('leads').select('id, email, phone').limit(1);

        if (leadData.email && leadData.phone) {
            query = query.or(`email.eq.${leadData.email},phone.eq.${leadData.phone}`);
        } else if (leadData.email) {
            query = query.eq('email', leadData.email);
        } else if (leadData.phone) {
            query = query.eq('phone', leadData.phone);
        }

        const { data: existingLeads, error: searchError } = await query;

        if (searchError) {
            console.error('[Webhook] DB Search Error:', searchError);
            return NextResponse.json({ error: 'DB Error' }, { status: 500 });
        }

        const existingLead = existingLeads?.[0];

        if (existingLead) {
            // UPDATE
            console.log('[Webhook] Updating existing lead:', existingLead.id);
            const { error: updateError } = await admin
                .from('leads')
                .update({
                    source: 'Facebook Lead Form',
                    // updated_at column does not exist in MVP schema
                })
                .eq('id', existingLead.id);

            if (updateError) {
                console.error('[Webhook] Update Error:', updateError);
                return NextResponse.json({ error: 'Update Failed' }, { status: 500 });
            }
        } else {
            // INSERT
            console.log('[Webhook] Creating new lead.');
            const { error: insertError } = await admin.from('leads').insert({
                email: leadData.email || null,
                phone: leadData.phone || null,
                first_name: leadData.first_name || 'Unknown',
                last_name: leadData.last_name || '',
                source: 'Facebook Lead Form',
                stage: LEAD_STAGES[0], // 'New'
                owner_id: null, // Pool
            });

            if (insertError) {
                console.error('[Webhook] Insert Error:', insertError);
                return NextResponse.json({ error: 'Insert Failed' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('[Webhook] Unexpected Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
