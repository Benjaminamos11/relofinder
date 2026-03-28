/**
 * GET /api/agencies/compare?names=PackImpex,Packimpex,Prime Relocation
 * Public API — side-by-side comparison
 */
import type { APIRoute } from 'astro';
import { handleCompareAgencies } from '../../../lib/relofinder-tools';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const names = url.searchParams.get('names')?.split(',').map(s => s.trim()).filter(Boolean);

  if (!names || names.length < 2) {
    return new Response(JSON.stringify({ error: 'Provide ?names= with 2-3 comma-separated agency names' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await handleCompareAgencies({ agency_names: names });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
