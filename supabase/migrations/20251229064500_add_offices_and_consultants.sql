-- Migration: Add Offices and Consultants
-- Created: 2025-12-29
-- Description: Adds tables for multiple offices and relocation consultants with many-to-many relationships.

-- 1. Relocation Consultants (The actual people)
CREATE TABLE IF NOT EXISTS public.relocation_consultants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Junction Table: Consultants working for Companies
CREATE TABLE IF NOT EXISTS public.relocator_consultants (
    consultant_id UUID REFERENCES public.relocation_consultants(id) ON DELETE CASCADE,
    relocator_id UUID REFERENCES public.relocators(id) ON DELETE CASCADE,
    role TEXT, -- e.g. 'Senior Consultant', 'Founder'
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (consultant_id, relocator_id)
);

-- 3. Additional Offices
CREATE TABLE IF NOT EXISTS public.relocator_offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relocator_id UUID REFERENCES public.relocators(id) ON DELETE CASCADE,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    zip TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.relocation_consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relocator_consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relocator_offices ENABLE ROW LEVEL SECURITY;

-- Admin-only access for now (Internal intelligence)
CREATE POLICY "Admin full access consultants" ON public.relocation_consultants
    FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Admin full access relocator_consultants" ON public.relocator_consultants
    FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

CREATE POLICY "Admin full access relocator_offices" ON public.relocator_offices
    FOR ALL TO authenticated
    USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'));

-- Public read for offices (useful for directory later)
CREATE POLICY "Public read offices" ON public.relocator_offices
    FOR SELECT TO anon, authenticated
    USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_consultants_updated_at BEFORE UPDATE ON public.relocation_consultants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
