-- ReloFinder Agency Profiles System
-- Migration: 001_agency_profiles_system
-- Created: 2025-10-03

-- ============================================================
-- AGENCIES & TAXONOMY
-- ============================================================

-- Main agencies table
create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  year_founded int,
  languages text[],
  website_url text,
  phone text,
  email text,
  meeting_url text,  -- Cal.com/Calendly link for preferred tier
  status text not null default 'standard' check (status in ('standard','partner','preferred')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Services taxonomy
create table if not exists public.services (
  id serial primary key,
  code text unique not null,
  label text not null
);

-- Agency-to-Service mapping
create table if not exists public.agency_services (
  agency_id uuid references public.agencies(id) on delete cascade,
  service_id int references public.services(id) on delete cascade,
  primary key (agency_id, service_id)
);

-- Regions taxonomy
create table if not exists public.regions (
  id serial primary key,
  code text unique not null,
  label text not null
);

-- Agency-to-Region mapping
create table if not exists public.agency_regions (
  agency_id uuid references public.agencies(id) on delete cascade,
  region_id int references public.regions(id) on delete cascade,
  primary key (agency_id, region_id)
);

-- ============================================================
-- REVIEWS & RATINGS
-- ============================================================

-- Internal (ReloFinder platform) user reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  service_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_published boolean default true,
  is_verified boolean default false
);

-- Agency replies to reviews (partner/preferred only)
create table if not exists public.review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references public.reviews(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete cascade,
  author_name text,
  body text not null,
  created_at timestamptz default now()
);

-- Review helpfulness votes
create table if not exists public.review_votes (
  review_id uuid references public.reviews(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  is_helpful boolean not null,
  created_at timestamptz default now(),
  primary key(review_id, user_id)
);

-- External reviews snapshots (Google, LinkedIn, etc.)
create table if not exists public.external_reviews (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  source text not null,
  rating numeric(3,2) not null,
  review_count int not null,
  payload jsonb,
  captured_at timestamptz not null default now()
);

-- AI-generated review summaries
create table if not exists public.review_summaries (
  agency_id uuid references public.agencies(id) on delete cascade primary key,
  summary text,
  positives text[],
  negatives text[],
  updated_at timestamptz default now()
);

-- ============================================================
-- LEADS & CONVERSIONS
-- ============================================================

-- Inbound lead submissions
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  message text,
  region_code text,
  service_code text,
  source_page text,
  sent_to_agency boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_agencies_slug on public.agencies (slug);
create index if not exists idx_agencies_status on public.agencies (status);
create index if not exists idx_reviews_agency on public.reviews (agency_id, created_at desc);
create index if not exists idx_reviews_published on public.reviews (is_published, created_at desc);
create index if not exists idx_external_reviews_agency on public.external_reviews (agency_id, captured_at desc);
create index if not exists idx_leads_agency on public.leads (agency_id, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Reviews: public read, authenticated insert/update own
alter table public.reviews enable row level security;

create policy "public_read_reviews" 
  on public.reviews for select 
  using (is_published = true);

create policy "users_insert_own_reviews" 
  on public.reviews for insert 
  with check (auth.uid() = user_id);

create policy "users_update_own_reviews" 
  on public.reviews for update 
  using (auth.uid() = user_id);

-- Review replies: public read, restricted insert (via API)
alter table public.review_replies enable row level security;

create policy "public_read_replies" 
  on public.review_replies for select 
  using (true);

-- Review votes: authenticated users only
alter table public.review_votes enable row level security;

create policy "users_vote_on_reviews" 
  on public.review_votes for all 
  using (auth.uid() = user_id);

-- Leads: public can create, only internal can read
alter table public.leads enable row level security;

create policy "public_create_leads" 
  on public.leads for insert 
  with check (true);

create policy "internal_read_leads" 
  on public.leads for select 
  using (false);  -- Deny public; only service role can read

-- External reviews: read-only for public
alter table public.external_reviews enable row level security;

create policy "public_read_external_reviews" 
  on public.external_reviews for select 
  using (true);

-- Review summaries: read-only for public
alter table public.review_summaries enable row level security;

create policy "public_read_summaries" 
  on public.review_summaries for select 
  using (true);

-- Agencies and taxonomy: public read
alter table public.agencies enable row level security;
alter table public.services enable row level security;
alter table public.regions enable row level security;
alter table public.agency_services enable row level security;
alter table public.agency_regions enable row level security;

create policy "public_read_agencies" on public.agencies for select using (true);
create policy "public_read_services" on public.services for select using (true);
create policy "public_read_regions" on public.regions for select using (true);
create policy "public_read_agency_services" on public.agency_services for select using (true);
create policy "public_read_agency_regions" on public.agency_regions for select using (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Insert base services
insert into public.services (code, label) values
  ('housing','Housing & Real Estate'),
  ('immigration','Visa & Immigration'),
  ('finance','Banking & Finance'),
  ('advisory','Advisory (HNWI/Corporate)'),
  ('education','Education & Schools'),
  ('settling_in','Settling-In')
on conflict (code) do nothing;

-- Insert base regions
insert into public.regions (code, label) values
  ('zurich','Zürich'),
  ('geneva','Geneva'),
  ('basel','Basel'),
  ('zug','Zug'),
  ('lausanne','Lausanne'),
  ('alps','Alpine Regions')
on conflict (code) do nothing;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_agencies_updated_at before update on public.agencies
  for each row execute function update_updated_at_column();

create trigger update_reviews_updated_at before update on public.reviews
  for each row execute function update_updated_at_column();

create trigger update_review_summaries_updated_at before update on public.review_summaries
  for each row execute function update_updated_at_column();

