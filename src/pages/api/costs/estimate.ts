/**
 * GET /api/costs/estimate?city=zurich&family_size=2
 */
import type { APIRoute } from 'astro';
import { handleEstimateLivingCosts } from '../../../lib/relofinder-tools';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const city = url.searchParams.get('city');
  const family_size = parseInt(url.searchParams.get('family_size') || '1', 10);

  if (!city) {
    return new Response(JSON.stringify({ error: 'Provide ?city= (zurich, geneva, zug, etc.)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = handleEstimateLivingCosts({ city, family_size });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
