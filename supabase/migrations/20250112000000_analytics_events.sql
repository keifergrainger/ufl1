-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    event_type text NOT NULL,
    page text,
    player_id text,
    section text,
    meta jsonb
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy for inserts (anon and authenticated)
CREATE POLICY "Allow public inserts"
    ON public.analytics_events
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create policy to disallow public selects (only admin/service role can read)
-- By default, if no SELECT policy is defined, access is denied. 
-- However, we explicitly want to allow service_role access which is granted by default on Supabase for superusers,
-- but good practice to be explicit if we were using a custom admin role. 
-- Since we rely on service role for admin reads (or direct dashboard access), we don't need a public SELECT policy.
-- Adding a policy that explicitly denies everything for SELECT to 'public' and 'authenticated' is key if we want to be restrictive.

-- Actually, simple RLS logic: if no SELECT policy exists for a role, they can't see anything.
-- So we just don't add a SELECT policy for anon/authenticated.

-- Grant usage on sequence/schema if needed (usually handled by default for public schema)
GRANT INSERT ON public.analytics_events TO anon;
GRANT INSERT ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO service_role;
GRANT SELECT ON public.analytics_events TO service_role;
