/**
 * GET /api/agencies/reviews?name=PackImpex  or  ?id=uuid
 * Public API — returns agency reviews + AI summary
 */
import type { APIRoute } from 'astro';
import { handleGetAgencyReviews } from '../../../lib/relofinder-tools';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const agency_name = url.searchParams.get('name') || undefined;
  const agency_id = url.searchParams.get('id') || undefined;

  if (!agency_name && !agency_id) {
    return new Response(JSON.stringify({ error: 'Provide ?name= or ?id=' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await handleGetAgencyReviews({ agency_name, agency_id });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
