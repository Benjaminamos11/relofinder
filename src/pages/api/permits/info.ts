/**
 * GET /api/permits/info?purpose=work&eu_citizen=true&nationality=German
 */
import type { APIRoute } from 'astro';
import { handleCheckPermitInfo } from '../../../lib/relofinder-tools';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const purpose = url.searchParams.get('purpose');
  const eu_citizen = url.searchParams.get('eu_citizen') === 'true';
  const nationality = url.searchParams.get('nationality') || undefined;

  if (!purpose) {
    return new Response(JSON.stringify({ error: 'Provide ?purpose= (work, study, retirement, family-reunification, self-employed)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = handleCheckPermitInfo({ purpose, eu_citizen, nationality });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
