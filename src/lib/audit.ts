import { getSupabaseAdmin } from './supabase/server';

export async function logAuditAction(params: {
    entityType: string;
    entityId: string;
    action: string;
    before: unknown;
    after: unknown;
    actorId: string;
}) {
    const admin = getSupabaseAdmin();

    const { error } = await admin.from('audit_logs').insert({
        entity_type: params.entityType,
        entity_id: params.entityId,
        action: params.action,
        before: params.before,
        after: params.after,
        actor_id: params.actorId,
    });

    if (error) {
        console.error('Failed to log audit action:', error);
    }
}
