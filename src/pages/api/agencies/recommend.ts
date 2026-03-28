/**
 * GET /api/agencies/recommend?region=zurich&services=housing,immigration&language=en&limit=3
 * Public API — also discoverable by AI agents via OpenAPI spec
 */
import type { APIRoute } from 'astro';
import { handleRecommendAgencies } from '../../../lib/relofinder-tools';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const region = url.searchParams.get('region') || undefined;
  const services = url.searchParams.get('services')?.split(',').map(s => s.trim()).filter(Boolean) || undefined;
  const language = url.searchParams.get('language') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '3', 10);

  const result = await handleRecommendAgencies({ region, services, language, limit });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
