'use server';

import { createAuthClient } from '@/lib/supabase/auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { logAuditAction } from '@/lib/audit';
import { LEAD_STAGES, EVENT_TYPES } from '@/lib/constants';

/**
 * Update basic lead info (name, phone, etc.) with audit logging
 */
export async function updateLeadInfo(id: string, data: Record<string, unknown>) {
    const supabase = await createAuthClient();

    // 1. Fetch current state for audit log
    const { data: beforeLead, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !beforeLead) {
        return { error: 'Lead not found or access denied.' };
    }

    // 2. Perform update
    const { data: afterLead, error } = await supabase
        .from('leads')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    // 3. Log Audit Action
    // Get current user for actor_id
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        await logAuditAction({
            entityType: 'lead',
            entityId: id,
            action: 'lead_update',
            before: beforeLead,
            after: afterLead,
            actorId: user.id,
        });
    }

    revalidatePath(`/leads/${id}`);
    revalidatePath(`/leads/${id}/edit`);
    return { success: true };
}

/**
 * Sync surgery types (many-to-many)
 * 1. Delete existing
 * 2. Insert new
 */
export async function updateSurgeryTypes(id: string, typeIds: string[]) {
    const supabase = await createAuthClient();
    const admin = getSupabaseAdmin();

    // 1. Verify Permissions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Check if user has access to this lead (owner or admin)
    // We can infer this by trying to fetch the lead with certain columns using the normal client,
    // which respects RLS. If we get the lead, the user has access.
    // However, to be extra safe and allow logic based on roles:
    const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('owner_id')
        .eq('id', id)
        .single();

    if (leadError || !lead) {
        return { error: 'Lead not found or access denied.' };
    }

    // If RLS allows fetching, we assume they can edit distinct relations if the business logic says so.
    // For 'Sales' role, 'leads_sales_all' allows ALL on leads they own. 
    // So if they can read it, they own it (or are admin).
    // We proceed with Admin client for the junction table to avoid RLS issues there.

    // 2. Delete all existing links for this lead
    const { error: deleteError } = await admin
        .from('lead_surgeries')
        .delete()
        .eq('lead_id', id);

    if (deleteError) {
        console.error('[updateSurgeryTypes] Delete Error', deleteError);
        return { error: deleteError.message };
    }

    // 3. Insert new links
    if (typeIds.length > 0) {
        const { error: insertError } = await admin.from('lead_surgeries').insert(
            typeIds.map((typeId) => ({
                lead_id: id,
                surgery_type_id: typeId,
            })),
        );

        if (insertError) {
            console.error('[updateSurgeryTypes] Insert Error', insertError);
            return { error: insertError.message };
        }
    }

    revalidatePath(`/leads/${id}`);
    revalidatePath(`/pipeline`);
    return { success: true };
}

/**
 * Add a new offer
 */
export async function addOffer(id: string, offer: { currency: string; amount?: number; offer_text: string }) {
    const supabase = await createAuthClient();
    const { error } = await supabase.from('offers').insert({
        lead_id: id,
        ...offer,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/leads/${id}`);
    return { success: true };
}

/**
 * Add a new event
 */
export async function addEvent(id: string, event: { type: string; start_at: string; notes?: string }) {
    const supabase = await createAuthClient();
    const { error } = await supabase.from('events').insert({
        lead_id: id,
        ...event,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/leads/${id}`);
    return { success: true };
}

/**
 * Change stage with validation guards and side effects
 */
export async function changeStage(id: string, newStage: string) {
    const supabase = await createAuthClient();
    const admin = getSupabaseAdmin(); // For queries requiring admin privileges or assignment

    // 1. Fetch current state for validation
    // We use `admin` here to ensure we see all data regardless of RLS, 
    // though `supabase` (auth client) should suffice if the user has access to the lead.
    // Using `supabase` ensures we check what the USER can see/access.
    interface LeadWithCounts {
        id: string;
        owner_id: string | null;
        offers: { count: number }[];
        lead_surgeries: { count: number }[];
        events: { type: string }[];
        stage?: string;
    }

    // 1. Verify Access
    // Check if user has access to this lead using normal client (RLS)
    const { data: accessCheck, error: accessError } = await supabase
        .from('leads')
        .select('id')
        .eq('id', id)
        .single();

    if (accessError || !accessCheck) {
        return { error: 'Lead not found or access denied.' };
    }

    // 2. Fetch current state for validation using ADMIN client
    // This ensures we get correct counts for related tables (surgeries) even if RLS/Permissions are tricky
    const { data, error } = await admin
        .from('leads')
        .select(`
      *,
      lead_surgeries (count),
      offers (count),
      events (type)
    `)
        .eq('id', id)
        .single();

    const lead = data as LeadWithCounts | null;

    if (error || !lead) {
        return { error: 'Lead data fetch failed.' };
    }

    // 2. Validate Guards
    if (newStage === LEAD_STAGES[3]) { // Offer Sent
        const offerCount = lead.offers?.[0]?.count ?? 0;
        const surgeryCount = lead.lead_surgeries?.[0]?.count ?? 0;

        if (offerCount < 1) {
            return { error: `Cannot move to ${LEAD_STAGES[3]}: Must have at least one offer.` };
        }
        if (surgeryCount < 1) {
            return { error: `Cannot move to ${LEAD_STAGES[3]}: Must select at least one surgery type.` };
        }
    }

    if (newStage === LEAD_STAGES[4]) { // Reservation Done
        const events = lead.events || [];
        const hasSurgery = events.some((e: { type: string }) => e.type === EVENT_TYPES[0]); // surgery
        const hasTransfer = events.some((e: { type: string }) => e.type === EVENT_TYPES[1]); // transfer

        if (!hasSurgery) {
            return { error: `Cannot move to ${LEAD_STAGES[4]}: Must have a "surgery" event.` };
        }
        if (!hasTransfer) {
            return { error: `Cannot move to ${LEAD_STAGES[4]}: Must have a "transfer" event.` };
        }
    }

    // 3. Prepare Update Data
    const updateData: Record<string, unknown> = { stage: newStage };

    // 4. Automation: Assign to Admin if "Reservation Done"
    if (newStage === LEAD_STAGES[4]) {
        const { data: currentOwnerProfile } = await admin
            .from('profiles')
            .select('role')
            .eq('id', lead.owner_id)
            .single();

        if (currentOwnerProfile?.role !== 'admin') {
            // Assign to DEFAULT_ADMIN_USER_ID if set, otherwise fallback to any admin
            if (process.env.DEFAULT_ADMIN_USER_ID) {
                updateData.owner_id = process.env.DEFAULT_ADMIN_USER_ID;
            } else {
                // Find any admin fallback
                const { data: adminUser } = await admin
                    .from('profiles')
                    .select('id')
                    .eq('role', 'admin')
                    .limit(1)
                    .single();

                if (adminUser) {
                    updateData.owner_id = adminUser.id;
                }
            }
        }
    }

    // 5. Perform Update
    const { error: updateError } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id);

    if (updateError) {
        return { error: updateError.message };
    }

    revalidatePath(`/leads/${id}`);

    // Log Audit Action
    // Get current user for actor_id
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        await logAuditAction({
            entityType: 'lead',
            entityId: id,
            action: 'stage_change',
            before: { stage: lead.stage },
            after: { stage: newStage },
            actorId: user.id,
        });
    }

    return { success: true };
}
