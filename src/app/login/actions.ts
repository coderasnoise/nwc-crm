'use server';

import { redirect } from 'next/navigation';
import { createAuthClient } from '@/lib/supabase/auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createAuthClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // Fetch role from profiles using ADMIN client (secret key)
    // This bypasses RLS and is the trusted server-side role check
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Failed to retrieve user after login.' };
    }

    const admin = getSupabaseAdmin();
    const { data: profile, error: profileError } = await admin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Profile fetch error:', profileError);
        return {
            error: `Profile error: ${profileError.message}`,
        };
    }

    if (!profile) {
        return { error: 'No profile found. Contact your administrator.' };
    }

    // Both admin and sales redirect to /leads
    redirect('/leads');
}
