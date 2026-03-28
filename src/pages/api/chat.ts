/**
 * /api/chat — ReloFinder AI Chat endpoint
 * Claude-powered with tool use for agency recommendations, reviews, permits, costs.
 */

import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import {
  TOOL_DEFINITIONS,
  handleRecommendAgencies,
  handleGetAgencyReviews,
  handleCompareAgencies,
  handleCreateLead,
  handleCheckPermitInfo,
  handleEstimateLivingCosts,
} from '../../lib/relofinder-tools';

export const prerender = false;

const SYSTEM_PROMPT = `You are ReloFinder AI, the smart assistant on relofinder.ch — Switzerland's leading relocation agency comparison platform.

**Your personality:** Friendly, knowledgeable, neutral. You help users find the right relocation agency for their situation. You don't favor any single company — you provide objective comparisons.

**Language:** Match the user's language. You speak English and German fluently. Default to English.

**Your goals (in order of priority):**
1. Understand the user's relocation needs (region, services, timeline, budget)
2. Recommend matching agencies from the database using recommend_agencies tool
3. Help compare agencies when asked (use compare_agencies tool)
4. Answer questions about Swiss relocation (permits, costs, regions)
5. Capture lead info naturally (name, email) using create_lead tool

**What ReloFinder offers:**
- Free comparison of Swiss relocation agencies
- Verified reviews from real expats
- Side-by-side agency comparisons
- Expert knowledge about Swiss relocation topics
- Free consultation booking with top agencies

**Key rules:**
- Stay neutral — never favor one agency over another without data
- When recommending, always explain WHY based on user's needs
- Always offer to show reviews when discussing specific agencies
- For insurance questions, suggest agencies that offer insurance services
- If unsure about facts, use the permit info or cost estimate tools
- Never make up agency names or reviews
- After providing value, suggest booking a free consultation

**Available regions:** Zurich, Geneva, Zug, Basel, Bern, Lucerne, Lausanne, Schwyz, Aargau, St. Gallen, Ticino, Valais, Vaud, and more

**Available services:** Housing, Immigration/Permits, Education/Schools, Insurance, Finance/Banking, Moving/Logistics, Corporate Relocation, Settling-in, Advisory

Keep responses concise (2-3 paragraphs max). Use tools proactively when relevant.`;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Chat not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { messages: Array<{ role: string; content: any }>; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const messages = body.messages.slice(-20);
  const client = new Anthropic({ apiKey });

  try {
    let currentMessages = [...messages];
    let finalResponse = '';
    let toolsUsed: string[] = [];
    let toolData: Record<string, any> = {};
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: TOOL_DEFINITIONS as any,
        messages: currentMessages as any,
      });

      const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
      const textBlocks = response.content.filter((b) => b.type === 'text');

      if (toolUseBlocks.length === 0) {
        finalResponse = textBlocks.map((b) => ('text' in b ? b.text : '')).join('');
        break;
      }

      currentMessages.push({ role: 'assistant', content: response.content as any });

      const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];

      for (const toolBlock of toolUseBlocks) {
        if (toolBlock.type !== 'tool_use') continue;
        const toolName = toolBlock.name;
        const toolInput = toolBlock.input as any;
        toolsUsed.push(toolName);

        let result: any;

        try {
          switch (toolName) {
            case 'recommend_agencies':
              result = await handleRecommendAgencies(toolInput);
              if (result?.agencies) toolData.agencies = result.agencies;
              break;
            case 'get_agency_reviews':
              result = await handleGetAgencyReviews(toolInput);
              if (result?.agency) toolData.reviewAgency = result.agency;
              if (result?.reviews) toolData.reviews = result.reviews;
              if (result?.summary) toolData.reviewSummary = result.summary;
              break;
            case 'compare_agencies':
              result = await handleCompareAgencies(toolInput);
              if (result?.agencies) toolData.comparison = result.agencies;
              break;
            case 'create_lead':
              result = await handleCreateLead(toolInput);
              break;
            case 'check_permit_info':
              result = handleCheckPermitInfo(toolInput);
              break;
            case 'estimate_living_costs':
              result = handleEstimateLivingCosts(toolInput);
              if (result?.costs) {
                toolData.costs = result.costs;
                toolData.costsTotal = result.total;
                toolData.costsCity = result.city;
              }
              break;
            default:
              result = { error: `Unknown tool: ${toolName}` };
          }
        } catch (toolErr) {
          console.error(`Tool ${toolName} error:`, toolErr);
          result = { success: false, error: `Tool failed: ${toolErr instanceof Error ? toolErr.message : 'Unknown'}` };
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolBlock.id,
          content: JSON.stringify(result),
        });
      }

      currentMessages.push({ role: 'user', content: toolResults as any });

      if (textBlocks.length > 0) {
        finalResponse += textBlocks.map((b) => ('text' in b ? b.text : '')).join('');
      }
    }

    return new Response(
      JSON.stringify({ response: finalResponse, toolsUsed, toolData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
