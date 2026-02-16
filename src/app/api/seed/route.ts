
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!
    );

    // 1. Surgery Types
    const { error: err1 } = await supabase.from('surgery_types').upsert([
        { name: 'Hair Transplant' },
        { name: 'Rhinoplasty' },
        { name: 'Dental Veneers' },
        { name: 'Breast Augmentation' },
    ], { onConflict: 'name' });

    if (err1) return NextResponse.json({ error: err1.message }, { status: 500 });

    // 2. Dummy Lead
    const { data: lead, error: err2 } = await supabase.from('leads').insert({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        country: 'United Kingdom',
        stage: 'New',
        source: 'Website',
        // Assign to current user if possible, or leave null (admin sees all)
    }).select().single();

    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });

    return NextResponse.json({ success: true, leadId: lead.id });
}
