import 'server-only';

import { createAuthClient } from '@/lib/supabase/auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export interface Lead {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    country: string | null;
    stage: string | null;
    owner_id: string | null;
    owner_name: string | null;
    created_at: string;
}

export interface LeadsQueryResult {
    leads: Lead[];
    totalCount: number;
}

export interface LeadsFilters {
    page: number;
    pageSize: number;
    search: string;
    stage: string;
    country: string;
    owner: string;
}

/**
 * Fetch leads with filters, search, and pagination.
 * Uses the auth client (publishable key + cookies) so RLS is enforced —
 * admin sees all leads, sales sees only their own.
 */
export async function fetchLeads(filters: LeadsFilters): Promise<LeadsQueryResult> {
    const supabase = await createAuthClient();

    const { page, pageSize, search, stage, country, owner } = filters;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('leads')
        .select('id, first_name, last_name, phone, country, stage, owner_id, created_at', {
            count: 'exact',
        });

    // Apply filters
    if (stage) {
        query = query.eq('stage', stage);
    }
    if (country) {
        query = query.eq('country', country);
    }
    if (owner) {
        query = query.eq('owner_id', owner);
    }

    // Search by name or phone
    if (search) {
        query = query.or(
            `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`,
        );
    }

    // Order and paginate
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
        console.error('Error fetching leads:', error);
        return { leads: [], totalCount: 0 };
    }

    // Fetch owner names for discovered owner_ids
    const ownerIds = Array.from(new Set((data ?? []).map((l) => l.owner_id).filter(Boolean))) as string[];
    let ownerMap: Record<string, string> = {};

    if (ownerIds.length > 0) {
        const admin = getSupabaseAdmin();
        const { data: owners } = await admin
            .from('profiles')
            .select('id, full_name')
            .in('id', ownerIds);

        if (owners) {
            ownerMap = Object.fromEntries(owners.map((o) => [o.id, o.full_name ?? 'Unknown']));
        }
    }

    const leads: Lead[] = (data ?? []).map((row) => ({
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
        country: row.country,
        stage: row.stage,
        owner_id: row.owner_id,
        owner_name: row.owner_id ? (ownerMap[row.owner_id] ?? 'Unknown') : null,
        created_at: row.created_at,
    }));

    return { leads, totalCount: count ?? 0 };
}

/** Fetch distinct values for filter dropdowns */
export async function fetchFilterOptions() {
    const admin = getSupabaseAdmin();

    const [stagesResult, countriesResult, ownersResult] = await Promise.all([
        admin.from('leads').select('stage').not('stage', 'is', null),
        admin.from('leads').select('country').not('country', 'is', null),
        admin.from('profiles').select('id, full_name').eq('role', 'sales'),
    ]);

    const stages = Array.from(new Set((stagesResult.data ?? []).map((r) => r.stage as string)));
    const countries = Array.from(new Set((countriesResult.data ?? []).map((r) => r.country as string)));
    const owners = (ownersResult.data ?? []).map((r) => ({
        id: r.id as string,
        name: (r.full_name as string) ?? 'Unknown',
    }));

    return { stages, countries, owners };
}

/** Fetch current user role from profiles */
export async function fetchCurrentUserRole(): Promise<string | null> {
    const supabase = await createAuthClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role ?? null;
}

export async function fetchLeadDetails(id: string) {
    const supabase = await createAuthClient();

    const { data: lead, error } = await supabase
        .from('leads')
        .select(`
            *,
            offers (
                id, currency, amount, offer_text, created_at
            ),
            events (
                id, type, start_at, notes, created_at
            )
        `)
        .eq('id', id)
        .single();

    if (error || !lead) {
        console.error('Error fetching lead details:', error);
        return null;
    }

    // Resolve owner name
    let ownerName = 'Unknown';
    if (lead.owner_id) {
        const admin = getSupabaseAdmin();
        const { data: profile } = await admin
            .from('profiles')
            .select('full_name')
            .eq('id', lead.owner_id)
            .single();
        if (profile) ownerName = profile.full_name || 'Unknown';
    }

    // Fetch surgeries using Admin client to bypass RLS/Permission issues on junction table
    const admin = getSupabaseAdmin();
    const { data: surgeries } = await admin
        .from('lead_surgeries')
        .select(`
            surgery_type_id,
            surgery_types (name)
        `)
        .eq('lead_id', id);

    // Return normalized shape
    return {
        ...lead,
        owner_name: ownerName,
        surgery_type_ids: (surgeries || []).map((ls: { surgery_type_id: string }) => ls.surgery_type_id),
        // Sort related by created_at desc
        offers: (lead.offers || []).sort(
            (a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
        events: (lead.events || []).sort(
            (a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
    };
}

export async function fetchSurgeryTypes() {
    const admin = getSupabaseAdmin();
    const { data } = await admin.from('surgery_types').select('*').order('name');
    return data ?? [];
}
