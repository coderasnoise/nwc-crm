-- Enable RLS
ALTER TABLE public.surgery_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_surgeries ENABLE ROW LEVEL SECURITY;

-- surgery_types policies
-- Drop existing policies if any to avoid errors on rerun
DROP POLICY IF EXISTS "Enable read access for all users" ON public.surgery_types;
DROP POLICY IF EXISTS "Enable all access for admin" ON public.surgery_types;

CREATE POLICY "Enable read access for all users" ON public.surgery_types
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for admin" ON public.surgery_types
    FOR ALL
    USING (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- lead_surgeries policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.lead_surgeries;
DROP POLICY IF EXISTS "Enable all access for admin" ON public.lead_surgeries;

CREATE POLICY "Enable read access for all users" ON public.lead_surgeries
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for admin" ON public.lead_surgeries
    FOR ALL
    USING (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );
