/**
 * ReloFinder AI Chat — Tool definitions + handlers
 * Shared logic used by both the chat API and public REST endpoints.
 */

import { supabaseAdmin } from './supabase-admin';
import { Resend } from 'resend';

// ─── Tool Definitions (for Claude) ───

export const TOOL_DEFINITIONS = [
  {
    name: 'recommend_agencies',
    description:
      'Find and recommend relocation agencies based on the user\'s region and services needed. Returns top matching agencies with ratings, services, and review summaries.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string' as const,
          description: 'Swiss region/canton the user is moving to (e.g. zurich, zug, geneva, basel, bern, lucerne, schwyz)',
        },
        services: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Services the user needs (e.g. housing, immigration, education, insurance, finance, moving)',
        },
        language: {
          type: 'string' as const,
          enum: ['en', 'de', 'fr'],
          description: 'User language preference — to filter agencies that speak it',
        },
        limit: {
          type: 'number' as const,
          description: 'Max agencies to return (default 3)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_agency_reviews',
    description:
      'Get review summary and top reviews for a specific agency. Use when user asks about a particular company.',
    input_schema: {
      type: 'object' as const,
      properties: {
        agency_name: {
          type: 'string' as const,
          description: 'Agency name (will fuzzy-match)',
        },
        agency_id: {
          type: 'string' as const,
          description: 'Agency UUID if known',
        },
      },
      required: [],
    },
  },
  {
    name: 'compare_agencies',
    description:
      'Compare 2-3 agencies side by side. Returns services, ratings, regions, and review highlights for each.',
    input_schema: {
      type: 'object' as const,
      properties: {
        agency_names: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Agency names to compare (2-3)',
        },
      },
      required: ['agency_names'],
    },
  },
  {
    name: 'create_lead',
    description:
      'Save user contact info as a lead and send a notification email with the full chat summary. Call when user provides name and email.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const },
        email: { type: 'string' as const },
        phone: { type: 'string' as const },
        region_code: { type: 'string' as const, description: 'Region they\'re interested in' },
        service_code: { type: 'string' as const, description: 'Primary service they need' },
        message: { type: 'string' as const, description: 'Full summary of the conversation — what the user is looking for, their situation, timeline, agencies discussed, and any recommendations made' },
        requested_agencies: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Agency names the user is interested in',
        },
      },
      required: ['name', 'email'],
    },
  },
  {
    name: 'check_permit_info',
    description:
      'Get info about Swiss work/residence permit types based on user situation.',
    input_schema: {
      type: 'object' as const,
      properties: {
        nationality: { type: 'string' as const, description: 'User nationality' },
        purpose: {
          type: 'string' as const,
          enum: ['work', 'family-reunification', 'study', 'retirement', 'self-employed'],
        },
        eu_citizen: { type: 'boolean' as const },
      },
      required: ['purpose'],
    },
  },
  {
    name: 'estimate_living_costs',
    description:
      'Estimate monthly living costs for a Swiss city, broken down by category.',
    input_schema: {
      type: 'object' as const,
      properties: {
        city: {
          type: 'string' as const,
          enum: ['zurich', 'geneva', 'lausanne', 'zug', 'lucerne', 'basel', 'bern'],
        },
        family_size: {
          type: 'number' as const,
          description: 'Household size (1=single, 2=couple, 3-5=family)',
        },
      },
      required: ['city'],
    },
  },
];

// ─── Tool Handlers ───

export async function handleRecommendAgencies(input: {
  region?: string;
  services?: string[];
  language?: string;
  limit?: number;
}): Promise<{ agencies: any[]; message: string }> {
  const maxResults = input.limit || 3;

  let query = supabaseAdmin
    .from('agencies')
    .select('id, slug, name, tagline, logo, tier, languages, regions_served, services, rating_breakdown, is_verified, website_url, meeting_url')
    .eq('accepting_new_customers', true)
    .limit(maxResults * 2); // fetch extra to filter

  const { data: agencies, error } = await query;
  if (error) return { agencies: [], message: `Database error: ${error.message}` };
  if (!agencies || agencies.length === 0) return { agencies: [], message: 'No agencies found.' };

  // Score and rank
  let scored = agencies.map(a => {
    let score = 0;
    // Region match
    if (input.region && a.regions_served) {
      const regions = (a.regions_served as string[]).map(r => r.toLowerCase());
      if (regions.some(r => r.includes(input.region!.toLowerCase()))) score += 10;
    }
    // Service match
    if (input.services && a.services) {
      const agencyServices = (a.services as string[]).map(s => s.toLowerCase());
      for (const needed of input.services) {
        if (agencyServices.some(s => s.includes(needed.toLowerCase()))) score += 5;
      }
    }
    // Language match
    if (input.language && a.languages) {
      const langs = (a.languages as string[]).map(l => l.toLowerCase());
      if (langs.some(l => l.includes(input.language!.toLowerCase()))) score += 3;
    }
    // Tier bonus
    if (a.tier === 'preferred') score += 4;
    else if (a.tier === 'partner') score += 2;
    // Verified bonus
    if (a.is_verified) score += 2;
    return { ...a, _score: score };
  });

  scored.sort((a, b) => b._score - a._score);
  const topAgencies = scored.slice(0, maxResults);

  // Fetch review stats for top agencies
  const agencyIds = topAgencies.map(a => a.id);
  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('agency_id, rating')
    .in('agency_id', agencyIds)
    .eq('is_published', true);

  const reviewStats: Record<string, { avg: number; count: number }> = {};
  if (reviews) {
    for (const r of reviews) {
      if (!reviewStats[r.agency_id]) reviewStats[r.agency_id] = { avg: 0, count: 0 };
      reviewStats[r.agency_id].count++;
      reviewStats[r.agency_id].avg += r.rating;
    }
    for (const id of Object.keys(reviewStats)) {
      reviewStats[id].avg = Math.round((reviewStats[id].avg / reviewStats[id].count) * 10) / 10;
    }
  }

  const results = topAgencies.map(a => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    tagline: a.tagline,
    logo: a.logo,
    tier: a.tier,
    is_verified: a.is_verified,
    services: a.services,
    regions_served: a.regions_served,
    languages: a.languages,
    website_url: a.website_url,
    meeting_url: a.meeting_url,
    rating: reviewStats[a.id]?.avg || null,
    review_count: reviewStats[a.id]?.count || 0,
    match_score: a._score,
    profile_url: `https://relofinder.ch/companies/${a.slug}`,
  }));

  return { agencies: results, message: `Found ${results.length} matching agencies.` };
}

export async function handleGetAgencyReviews(input: {
  agency_name?: string;
  agency_id?: string;
}): Promise<{ agency: any; reviews: any[]; summary: any; message: string }> {
  let agencyId = input.agency_id;

  if (!agencyId && input.agency_name) {
    const { data } = await supabaseAdmin
      .from('agencies')
      .select('id, slug, name, tagline, logo, tier')
      .ilike('name', `%${input.agency_name}%`)
      .limit(1)
      .maybeSingle();
    if (data) agencyId = data.id;
    else return { agency: null, reviews: [], summary: null, message: `Agency "${input.agency_name}" not found.` };
  }

  if (!agencyId) return { agency: null, reviews: [], summary: null, message: 'Please provide an agency name.' };

  const [agencyRes, reviewsRes, summaryRes] = await Promise.all([
    supabaseAdmin.from('agencies').select('id, slug, name, tagline, logo, tier, services, regions_served, languages').eq('id', agencyId).single(),
    supabaseAdmin.from('reviews').select('rating, title, body, author_name, created_at').eq('agency_id', agencyId).eq('is_published', true).order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('review_summaries').select('summary, positives, negatives').eq('agency_id', agencyId).maybeSingle(),
  ]);

  const agency = agencyRes.data;
  const reviews = reviewsRes.data || [];
  const summary = summaryRes.data;

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  return {
    agency: agency ? { ...agency, rating: avgRating, review_count: reviews.length, profile_url: `https://relofinder.ch/companies/${agency.slug}` } : null,
    reviews: reviews.map(r => ({ rating: r.rating, title: r.title, excerpt: r.body?.slice(0, 200), author: r.author_name, date: r.created_at })),
    summary,
    message: `Found ${reviews.length} reviews for ${agency?.name || 'agency'}.`,
  };
}

export async function handleCompareAgencies(input: {
  agency_names: string[];
}): Promise<{ agencies: any[]; message: string }> {
  const results: any[] = [];

  for (const name of input.agency_names.slice(0, 3)) {
    const { data: agency } = await supabaseAdmin
      .from('agencies')
      .select('id, slug, name, tagline, logo, tier, services, regions_served, languages, is_verified')
      .ilike('name', `%${name}%`)
      .limit(1)
      .maybeSingle();

    if (!agency) continue;

    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('agency_id', agency.id)
      .eq('is_published', true);

    const avgRating = reviews && reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;

    const { data: summary } = await supabaseAdmin
      .from('review_summaries')
      .select('positives, negatives')
      .eq('agency_id', agency.id)
      .maybeSingle();

    results.push({
      name: agency.name,
      slug: agency.slug,
      tagline: agency.tagline,
      tier: agency.tier,
      is_verified: agency.is_verified,
      services: agency.services,
      regions_served: agency.regions_served,
      languages: agency.languages,
      rating: avgRating,
      review_count: reviews?.length || 0,
      positives: summary?.positives?.slice(0, 3) || [],
      negatives: summary?.negatives?.slice(0, 2) || [],
      profile_url: `https://relofinder.ch/companies/${agency.slug}`,
    });
  }

  return { agencies: results, message: `Compared ${results.length} agencies.` };
}

export async function handleCreateLead(input: {
  name: string;
  email: string;
  phone?: string;
  region_code?: string;
  service_code?: string;
  message?: string;
  requested_agencies?: string[];
}): Promise<{ success: boolean; message: string }> {
  // Deduplicate (24h)
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabaseAdmin
    .from('leads')
    .select('id')
    .eq('email', input.email)
    .gte('created_at', dayAgo)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: true, message: 'Lead already exists.' };
  }

  const { error } = await supabaseAdmin.from('leads').insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    region_code: input.region_code || null,
    service_code: input.service_code || null,
    message: input.message || null,
    requested_agencies: input.requested_agencies || null,
    source_page: 'ai-chat',
    status: 'new',
  });

  if (error) return { success: false, message: error.message };

  // Send admin notification email with chat summary
  try {
    const resendKey = import.meta.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      const agencies = input.requested_agencies?.join(', ') || 'None specified';
      const chatSummary = input.message || 'No summary available';

      await resend.emails.send({
        from: 'ReloFinder AI <noreply@relofinder.ch>',
        to: ['info@relofinder.ch'],
        subject: `New AI Chat Lead — ${input.name}`,
        html: buildLeadEmailHtml({
          name: input.name,
          email: input.email,
          phone: input.phone,
          region: input.region_code,
          service: input.service_code,
          agencies,
          chatSummary,
        }),
      });
    }
  } catch {
    // Non-critical — lead is already saved
  }

  return { success: true, message: 'Lead captured.' };
}

function buildLeadEmailHtml(data: {
  name: string;
  email: string;
  phone?: string;
  region?: string;
  service?: string;
  agencies: string;
  chatSummary: string;
}): string {
  const rows = [
    ['Name', data.name],
    ['Email', `<a href="mailto:${data.email}">${data.email}</a>`],
    ...(data.phone ? [['Phone', data.phone]] : []),
    ...(data.region ? [['Region', data.region]] : []),
    ...(data.service ? [['Service', data.service]] : []),
    ['Agencies Discussed', data.agencies],
  ];

  const rowsHtml = rows.map(([label, value]) =>
    `<tr><td style="padding:8px 12px;font-weight:600;color:#2C3E50;border-bottom:1px solid #eee;width:140px;vertical-align:top">${label}</td><td style="padding:8px 12px;color:#444;border-bottom:1px solid #eee">${value}</td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Inter,Arial,sans-serif;background:#f5f5f5">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <!-- Header -->
    <div style="background:#2C3E50;padding:24px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">New AI Chat Lead</h1>
      <p style="margin:4px 0 0;color:#FF6F61;font-size:13px;font-weight:600">ReloFinder AI Assistant</p>
    </div>

    <!-- Lead Details -->
    <div style="padding:24px">
      <h2 style="margin:0 0 16px;color:#2C3E50;font-size:16px;font-weight:700">Lead Details</h2>
      <table style="width:100%;border-collapse:collapse">
        ${rowsHtml}
      </table>
    </div>

    <!-- Chat Summary -->
    <div style="padding:0 24px 24px">
      <h2 style="margin:0 0 12px;color:#2C3E50;font-size:16px;font-weight:700">Chat Summary</h2>
      <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:16px;color:#444;font-size:14px;line-height:1.6;white-space:pre-wrap">${data.chatSummary}</div>
    </div>

    <!-- Footer -->
    <div style="background:#f8f9fa;padding:16px 24px;text-align:center;border-top:1px solid #eee">
      <p style="margin:0;color:#999;font-size:11px">This lead was captured by ReloFinder AI Chat at ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC</p>
      <p style="margin:4px 0 0;color:#999;font-size:11px"><a href="https://relofinder.ch" style="color:#FF6F61">relofinder.ch</a></p>
    </div>
  </div>
</body>
</html>`;
}

export function handleCheckPermitInfo(input: {
  nationality?: string;
  purpose: string;
  eu_citizen?: boolean;
}): { info: string; permit_type: string; documents: string[] } {
  const isEU = input.eu_citizen ?? false;
  let permit_type = '';
  let info = '';
  let documents: string[] = [];

  switch (input.purpose) {
    case 'work':
      if (isEU) {
        permit_type = 'B Permit (EU/EFTA)';
        info = 'EU/EFTA citizens have the right to live and work in Switzerland. The B permit is issued for 5 years if you have an employment contract of 1+ year.';
        documents = ['Valid passport/ID', 'Employment contract (1+ year)', 'Proof of health insurance', 'Application form (canton-specific)', 'Passport photos'];
      } else {
        permit_type = 'B Permit (Third-country)';
        info = 'Non-EU citizens need employer sponsorship. The employer must prove no suitable candidate was found in CH/EU. Subject to annual quotas.';
        documents = ['Valid passport', 'Employment contract', 'Employer\'s labor market test proof', 'Qualification certificates', 'Health insurance proof', 'Criminal record extract', 'Application form'];
      }
      break;
    case 'family-reunification':
      permit_type = 'B Permit (Family)';
      info = 'Family members of Swiss citizens or permit holders can apply for family reunification. Spouse and children under 18 are eligible.';
      documents = ['Valid passport', 'Marriage/birth certificate (apostilled)', 'Sponsor\'s permit copy', 'Proof of adequate housing', 'Financial proof', 'Health insurance'];
      break;
    case 'study':
      permit_type = 'B Permit (Student)';
      info = 'Student permits are issued for the duration of studies. Must prove admission to a recognized institution and sufficient financial means.';
      documents = ['Valid passport', 'University admission letter', 'Proof of financial means (CHF 21,000/year)', 'Health insurance', 'Academic transcripts'];
      break;
    case 'retirement':
      permit_type = 'B Permit (Retirement)';
      info = 'Retirees can apply if they have strong ties to Switzerland, are over 55, and have sufficient financial means. No work permitted.';
      documents = ['Valid passport', 'Proof of retirement income/pension', 'Health insurance', 'Proof of Swiss ties', 'Bank statements'];
      break;
    case 'self-employed':
      permit_type = 'B Permit (Self-employed)';
      info = 'Self-employment permits require proof that your business benefits the Swiss economy. Must present a viable business plan.';
      documents = ['Valid passport', 'Business plan', 'Financial projections', 'Proof of initial capital', 'Professional qualifications', 'Health insurance'];
      break;
    default:
      permit_type = 'Unknown';
      info = 'Please specify your purpose for moving to Switzerland.';
  }

  return { info, permit_type, documents };
}

export function handleEstimateLivingCosts(input: {
  city: string;
  family_size?: number;
}): { costs: Record<string, number>; total: number; city: string } {
  const size = input.family_size || 1;
  const baseCosts: Record<string, Record<string, number>> = {
    zurich: { rent: 2200, health_insurance: 450, groceries: 600, transport: 120, dining: 300, utilities: 200, misc: 400 },
    geneva: { rent: 2400, health_insurance: 500, groceries: 650, transport: 120, dining: 350, utilities: 220, misc: 400 },
    lausanne: { rent: 1900, health_insurance: 480, groceries: 550, transport: 100, dining: 280, utilities: 190, misc: 350 },
    zug: { rent: 2000, health_insurance: 380, groceries: 550, transport: 100, dining: 280, utilities: 180, misc: 350 },
    lucerne: { rent: 1700, health_insurance: 400, groceries: 500, transport: 90, dining: 250, utilities: 170, misc: 320 },
    basel: { rent: 1800, health_insurance: 420, groceries: 520, transport: 100, dining: 260, utilities: 180, misc: 330 },
    bern: { rent: 1600, health_insurance: 410, groceries: 500, transport: 100, dining: 240, utilities: 170, misc: 310 },
  };

  const base = baseCosts[input.city] || baseCosts.zurich;
  const multiplier = size <= 1 ? 1 : size <= 2 ? 1.5 : size <= 3 ? 1.9 : size <= 4 ? 2.2 : 2.5;

  const costs: Record<string, number> = {};
  let total = 0;
  for (const [k, v] of Object.entries(base)) {
    costs[k] = Math.round(v * multiplier);
    total += costs[k];
  }

  return { costs, total, city: input.city };
}
