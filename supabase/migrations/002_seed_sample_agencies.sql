-- Seed Sample Agencies
-- Migration: 002_seed_sample_agencies
-- Created: 2025-10-03

-- ============================================================
-- PRIME RELOCATION (Preferred Partner - Sample Profile)
-- ============================================================

-- Insert Prime Relocation
insert into public.agencies (
  slug,
  name,
  tagline,
  year_founded,
  languages,
  website_url,
  phone,
  email,
  meeting_url,
  status
) values (
  'prime-relocation',
  'Prime Relocation',
  'Verified Swiss Relocation Agency since 2008',
  2008,
  ARRAY['en', 'de', 'fr', 'it'],
  'https://www.prime-relocation.ch',
  '+41 44 123 4567',
  'contact@prime-relocation.ch',
  'https://calendly.com/prime-relocation',
  'preferred'
) on conflict (slug) do nothing;

-- Get Prime Relocation ID for relations
do $$
declare
  prime_id uuid;
  housing_id int;
  immigration_id int;
  finance_id int;
  advisory_id int;
  settling_id int;
  zurich_id int;
  geneva_id int;
  basel_id int;
  zug_id int;
begin
  -- Get agency ID
  select id into prime_id from public.agencies where slug = 'prime-relocation';
  
  if prime_id is null then
    raise notice 'Prime Relocation not found, skipping relations';
    return;
  end if;

  -- Get service IDs
  select id into housing_id from public.services where code = 'housing';
  select id into immigration_id from public.services where code = 'immigration';
  select id into finance_id from public.services where code = 'finance';
  select id into advisory_id from public.services where code = 'advisory';
  select id into settling_id from public.services where code = 'settling_in';

  -- Get region IDs
  select id into zurich_id from public.regions where code = 'zurich';
  select id into geneva_id from public.regions where code = 'geneva';
  select id into basel_id from public.regions where code = 'basel';
  select id into zug_id from public.regions where code = 'zug';

  -- Link services
  insert into public.agency_services (agency_id, service_id) values
    (prime_id, housing_id),
    (prime_id, immigration_id),
    (prime_id, finance_id),
    (prime_id, advisory_id),
    (prime_id, settling_id)
  on conflict do nothing;

  -- Link regions
  insert into public.agency_regions (agency_id, region_id) values
    (prime_id, zurich_id),
    (prime_id, geneva_id),
    (prime_id, basel_id),
    (prime_id, zug_id)
  on conflict do nothing;

  -- Add sample external review (Google)
  insert into public.external_reviews (
    agency_id,
    source,
    rating,
    review_count,
    payload,
    captured_at
  ) values (
    prime_id,
    'google',
    4.8,
    53,
    jsonb_build_object(
      'place_id', 'ChIJa76xwh5jjkcRW8H3M4Kt0Os',
      'business_status', 'OPERATIONAL',
      'formatted_address', 'Zürich, Switzerland'
    ),
    now()
  ) on conflict do nothing;

  -- Add AI summary
  insert into public.review_summaries (
    agency_id,
    summary,
    positives,
    negatives
  ) values (
    prime_id,
    'Prime Relocation is highly regarded for their comprehensive service offering and professional approach to corporate and private relocations. Clients consistently praise their attention to detail and multilingual support.',
    ARRAY[
      'Excellent communication and responsive team',
      'Comprehensive end-to-end relocation services',
      'Deep knowledge of Swiss regulations and processes',
      'Strong support for corporate clients',
      'Multilingual capabilities (EN, DE, FR, IT)'
    ],
    ARRAY[
      'Premium pricing compared to some competitors',
      'High demand requires advance booking',
      'Some services require minimum engagement period'
    ]
  ) on conflict (agency_id) do update set
    summary = excluded.summary,
    positives = excluded.positives,
    negatives = excluded.negatives,
    updated_at = now();

end $$;

-- ============================================================
-- ADDITIONAL SAMPLE AGENCIES (for alternatives)
-- ============================================================

-- Auris Relocation (Partner)
insert into public.agencies (
  slug,
  name,
  tagline,
  year_founded,
  languages,
  website_url,
  phone,
  email,
  status
) values (
  'auris-relocation',
  'Auris Relocation',
  'Personalized relocation services since 2012',
  2012,
  ARRAY['en', 'de', 'fr'],
  'https://www.aurisag.com',
  '+41 44 987 6543',
  'info@aurisag.com',
  'partner'
) on conflict (slug) do nothing;

-- Lodge Brothers (Standard)
insert into public.agencies (
  slug,
  name,
  tagline,
  year_founded,
  languages,
  website_url,
  phone,
  status
) values (
  'lodge-brothers',
  'Lodge Brothers Relocation',
  'Affordable relocation solutions',
  2015,
  ARRAY['en', 'de'],
  'https://www.lodgebrothers.ch',
  '+41 22 555 1234',
  'standard'
) on conflict (slug) do nothing;

-- Lifestyle Managers (Preferred)
insert into public.agencies (
  slug,
  name,
  tagline,
  year_founded,
  languages,
  website_url,
  phone,
  email,
  meeting_url,
  status
) values (
  'lifestyle-managers',
  'Lifestyle Managers',
  'Premium concierge relocation services',
  2005,
  ARRAY['en', 'de', 'fr', 'it', 'es'],
  'https://www.lifestylemanagers.ch',
  '+41 22 345 6789',
  'contact@lifestylemanagers.ch',
  'https://calendly.com/lifestyle-managers',
  'preferred'
) on conflict (slug) do nothing;

-- Link services and regions for alternative agencies
do $$
declare
  auris_id uuid;
  lodge_id uuid;
  lifestyle_id uuid;
begin
  select id into auris_id from public.agencies where slug = 'auris-relocation';
  select id into lodge_id from public.agencies where slug = 'lodge-brothers';
  select id into lifestyle_id from public.agencies where slug = 'lifestyle-managers';

  -- Auris: Housing, Immigration, Settling-In in Zurich, Basel
  if auris_id is not null then
    insert into public.agency_services (agency_id, service_id)
    select auris_id, id from public.services where code in ('housing', 'immigration', 'settling_in')
    on conflict do nothing;
    
    insert into public.agency_regions (agency_id, region_id)
    select auris_id, id from public.regions where code in ('zurich', 'basel')
    on conflict do nothing;
  end if;

  -- Lodge: Housing, Settling-In in Geneva
  if lodge_id is not null then
    insert into public.agency_services (agency_id, service_id)
    select lodge_id, id from public.services where code in ('housing', 'settling_in')
    on conflict do nothing;
    
    insert into public.agency_regions (agency_id, region_id)
    select lodge_id, id from public.regions where code = 'geneva'
    on conflict do nothing;
  end if;

  -- Lifestyle: All services in Zurich, Geneva, Zug
  if lifestyle_id is not null then
    insert into public.agency_services (agency_id, service_id)
    select lifestyle_id, id from public.services
    on conflict do nothing;
    
    insert into public.agency_regions (agency_id, region_id)
    select lifestyle_id, id from public.regions where code in ('zurich', 'geneva', 'zug')
    on conflict do nothing;
  end if;

end $$;

-- ============================================================
-- SAMPLE REVIEWS FOR PRIME RELOCATION
-- ============================================================

-- Note: These are sample reviews. In production, user_id should reference real users.
-- For now, we'll create anonymous reviews (user_id = NULL)

do $$
declare
  prime_id uuid;
begin
  select id into prime_id from public.agencies where slug = 'prime-relocation';
  
  if prime_id is null then
    return;
  end if;

  -- Review 1: 5 stars - Housing service
  insert into public.reviews (
    agency_id,
    user_id,
    rating,
    title,
    body,
    service_code,
    is_published,
    is_verified,
    created_at
  ) values (
    prime_id,
    null,
    5,
    'Exceptional service from start to finish',
    'Prime Relocation made our move to Zurich seamless. Their team helped us find the perfect apartment, handled all the paperwork, and even assisted with setting up utilities. Highly recommend!',
    'housing',
    true,
    true,
    now() - interval '45 days'
  );

  -- Review 2: 5 stars - Immigration service
  insert into public.reviews (
    agency_id,
    user_id,
    rating,
    title,
    body,
    service_code,
    is_published,
    is_verified,
    created_at
  ) values (
    prime_id,
    null,
    5,
    'Visa process made easy',
    'Navigating the Swiss immigration system seemed daunting, but Prime Relocation guided us through every step. Their expertise saved us time and stress.',
    'immigration',
    true,
    true,
    now() - interval '30 days'
  );

  -- Review 3: 4 stars - Overall service
  insert into public.reviews (
    agency_id,
    user_id,
    rating,
    title,
    body,
    service_code,
    is_published,
    is_verified,
    created_at
  ) values (
    prime_id,
    null,
    4,
    'Professional and reliable',
    'Great experience overall. The team was professional and responsive. Only minor issue was the premium pricing, but the quality of service justified it.',
    'advisory',
    true,
    true,
    now() - interval '15 days'
  );

  -- Review 4: 5 stars - Corporate relocation
  insert into public.reviews (
    agency_id,
    user_id,
    rating,
    title,
    body,
    service_code,
    is_published,
    is_verified,
    created_at
  ) values (
    prime_id,
    null,
    5,
    'Perfect for corporate moves',
    'Our company has used Prime Relocation for multiple employee relocations. Consistent quality, attention to detail, and excellent coordination with our HR team.',
    'advisory',
    true,
    true,
    now() - interval '7 days'
  );

  -- Review 5: 5 stars - Family relocation
  insert into public.reviews (
    agency_id,
    user_id,
    rating,
    title,
    body,
    service_code,
    is_published,
    is_verified,
    created_at
  ) values (
    prime_id,
    null,
    5,
    'Made our family feel at home',
    'Moving with children to a new country is challenging. Prime Relocation helped us find schools, set up our home, and even provided cultural orientation. Couldn''t have asked for more!',
    'education',
    true,
    true,
    now() - interval '3 days'
  );

end $$;

-- ============================================================
-- SAMPLE AGENCY REPLY
-- ============================================================

do $$
declare
  prime_id uuid;
  review_id uuid;
begin
  select id into prime_id from public.agencies where slug = 'prime-relocation';
  
  if prime_id is null then
    return;
  end if;

  -- Get the 4-star review (the one with minor pricing feedback)
  select id into review_id from public.reviews 
  where agency_id = prime_id and rating = 4 
  order by created_at desc 
  limit 1;

  if review_id is not null then
    insert into public.review_replies (
      review_id,
      agency_id,
      author_name,
      body,
      created_at
    ) values (
      review_id,
      prime_id,
      'Prime Relocation Team',
      'Thank you for your positive feedback! We''re glad you found our service professional and reliable. We understand that our pricing reflects our premium service level, and we''re committed to delivering exceptional value. If you ever need assistance in the future, we''re here to help!',
      now() - interval '14 days'
    );
  end if;

end $$;

