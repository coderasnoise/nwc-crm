'use server';

import { createAuthClient } from '@/lib/supabase/auth';
import { revalidatePath } from 'next/cache';
import { logAuditAction } from '@/lib/audit';
import { EVENT_TYPES, EventType } from '@/lib/constants';

export interface CalendarEvent {
    id: string;
    lead_id: string;
    type: EventType;
    start_at: string; // ISO string
    notes: string | null;
    lead: {
        first_name: string | null;
        last_name: string | null;
    } | null;
}

export async function fetchMonthEvents(start: string, end: string) {
    const supabase = await createAuthClient();

    const { data: events, error } = await supabase
        .from('events')
        .select(`
            id,
            lead_id,
            type,
            start_at,
            notes,
            lead:leads (
                first_name,
                last_name
            )
        `)
        .gte('start_at', start)
        .lte('start_at', end)
        .order('start_at', { ascending: true });

    if (error) {
        console.error('Error fetching calendar events:', error);
        return [];
    }

    return (events as unknown as CalendarEvent[]) || [];
}

export async function searchLeads(query: string) {
    const supabase = await createAuthClient();

    let q = supabase
        .from('leads')
        .select('id, first_name, last_name, phone')
        .limit(10);

    if (query) {
        q = q.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%`);
    }

    const { data, error } = await q;

    if (error) {
        console.error('Error searching leads:', error);
        return [];
    }

    return data || [];
}

export async function createCalendarEvent(data: {
    lead_id: string;
    type: string;
    start_at: string;
    notes?: string;
}) {
    const supabase = await createAuthClient();

    // Validate type
    if (!EVENT_TYPES.includes(data.type as EventType)) {
        return { error: 'Invalid event type' };
    }

    const { data: newEvent, error } = await supabase
        .from('events')
        .insert(data)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/calendar');
    revalidatePath(`/leads/${data.lead_id}`);

    // Audit Log
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        await logAuditAction({
            entityType: 'lead', // Linked to lead
            entityId: data.lead_id,
            action: 'lead_update', // Or specific 'event_create' if needed, but 'lead_update' covers it for now as part of history
            before: {},
            after: newEvent,
            actorId: user.id,
        });
    }

    return { success: true };
}
