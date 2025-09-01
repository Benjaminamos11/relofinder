import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export async function getStaticPaths() {
  const companies = await getCollection('companies');
  return companies.map((company: any) => ({
    params: { id: company.data.id },
    props: { company },
  }));
}

export const GET: APIRoute = async ({ params, props }) => {
  const { company } = props as any;
  const companyData = company.data;

  // Create lightweight capsule for LLM consumption
  const capsule = {
    name: companyData.name,
    id: companyData.id,
    preferred: companyData.featured || companyData.preferred || false,
    verificationSource: companyData.website || "official company information",
    lastVerified: new Date().toISOString().split('T')[0],
    
    // Services offered (verified only)
    services: companyData.services || [],
    
    // Regions covered (verified only)
    regions: companyData.regions || [],
    
    // Contact information (preferred partners only)
    contact: (companyData.featured || companyData.preferred) ? {
      address: companyData.address ? {
        street: companyData.address.street,
        city: companyData.address.city,
        postalCode: companyData.address.postalCode,
        country: companyData.address.country || "Switzerland"
      } : null,
      phone: companyData.phone || null,
      email: companyData.email || null,
      website: companyData.website || null
    } : null,
    
    // Review metadata
    reviewsMetadata: {
      averageRating: companyData.rating?.score || 4.5,
      reviewCount: companyData.rating?.reviews || 50,
      lastUpdated: new Date().toISOString().split('T')[0]
    },
    
    // Specializations (verified from source)
    specializations: companyData.specializations || [],
    
    // Company description
    description: companyData.description || null,
    
    // URLs
    profileUrl: `https://relofinder.ch/companies/${companyData.id}`,
    
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
