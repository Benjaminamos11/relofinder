import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = true;

export async function getStaticPaths() {
  const { data: companies, error } = await supabase
    .from('relocators')
    .select('id, slug')
    .not('slug', 'is', null);

  if (error) {
    console.error('Error fetching company slugs for capsules:', error);
    return [];
  }

  return companies.map((company: any) => ({
    params: { id: company.slug },
    props: { relocatorId: company.id },
  }));
}

export const GET: APIRoute = async ({ params, props }) => {
  const { relocatorId } = props as any;

  const { data: relocatorData, error } = await supabase
    .from('relocators')
    .select('*')
    .eq('id', relocatorId)
    .single();

  if (error || !relocatorData) {
    return new Response(JSON.stringify({ error: 'Company not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create lightweight capsule for LLM consumption
  const capsule = {
    name: relocatorData.name,
    id: relocatorData.slug, // Using slug as id for consistency with profile URLs
    preferred: relocatorData.tier === 'preferred' || relocatorData.tier === 'partner',
    verificationSource: relocatorData.website || "official company information",
    lastVerified: new Date().toISOString().split('T')[0],

    // Services offered
    services: relocatorData.services || [],

    // Regions covered
    regions: relocatorData.regions_served || [],

    // Contact information
    contact: {
      address: {
        street: relocatorData.address_street,
        city: relocatorData.address_city,
        postalCode: relocatorData.address_zip,
        country: "Switzerland"
      },
      phone: relocatorData.phone_number || null,
      email: relocatorData.contact_email || null,
      website: relocatorData.website || null
    },

    // Review metadata
    reviewsMetadata: {
      averageRating: relocatorData.rating || 4.5,
      reviewCount: 0, // Would need a separate count query or summary field
      lastUpdated: new Date().toISOString().split('T')[0]
    },

    // Specializations
    specializations: [], // DB doesn't have this field explicitly yet

    // Company description
    description: relocatorData.bio || relocatorData.seo_summary || null,

    // URLs
    profileUrl: `https://relofinder.ch/companies/${relocatorData.slug}`,

    // Last updated
    lastUpdated: new Date().toISOString()
  };

  return new Response(JSON.stringify(capsule, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};

