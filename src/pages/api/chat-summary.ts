/**
 * /api/chat-summary — Send chat transcript email after inactivity
 * Fires from frontend after 3 minutes of no new messages.
 */

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) {
    return new Response(JSON.stringify({ error: 'Email not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: {
    messages: Array<{ role: string; content: string }>;
    toolsUsed?: string[];
    pageUrl?: string;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.messages?.length) {
    return new Response(JSON.stringify({ error: 'No messages' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const transcript = body.messages
    .map((m) => `${m.role === 'user' ? '👤 User' : '🤖 ReloFinder AI'}:\n${m.content}`)
    .join('\n\n---\n\n');

  const toolsList = body.toolsUsed?.length
    ? body.toolsUsed.join(', ')
    : 'None';

  const messageCount = body.messages.length;
  const userMessages = body.messages.filter((m) => m.role === 'user').length;
  const firstUserMsg = body.messages.find((m) => m.role === 'user')?.content?.slice(0, 100) || 'N/A';
  const pageUrl = body.pageUrl || 'Unknown';
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Inter,Arial,sans-serif;background:#f5f5f5">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <div style="background:#2C3E50;padding:24px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">Chat Session Summary</h1>
      <p style="margin:4px 0 0;color:#FF6F61;font-size:13px;font-weight:600">ReloFinder AI — ${timestamp} UTC</p>
    </div>

    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#2C3E50;border-bottom:1px solid #eee;width:150px">Messages</td>
          <td style="padding:8px 12px;color:#444;border-bottom:1px solid #eee">${messageCount} total (${userMessages} from user)</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#2C3E50;border-bottom:1px solid #eee">First Question</td>
          <td style="padding:8px 12px;color:#444;border-bottom:1px solid #eee">${escapeHtml(firstUserMsg)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#2C3E50;border-bottom:1px solid #eee">Tools Used</td>
          <td style="padding:8px 12px;color:#444;border-bottom:1px solid #eee">${escapeHtml(toolsList)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:600;color:#2C3E50;border-bottom:1px solid #eee">Page</td>
          <td style="padding:8px 12px;color:#444;border-bottom:1px solid #eee">${escapeHtml(pageUrl)}</td>
        </tr>
      </table>

      <h2 style="margin:0 0 12px;color:#2C3E50;font-size:16px;font-weight:700">Full Transcript</h2>
      <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:16px;color:#444;font-size:13px;line-height:1.7;white-space:pre-wrap">${escapeHtml(transcript)}</div>
    </div>

    <div style="background:#f8f9fa;padding:16px 24px;text-align:center;border-top:1px solid #eee">
      <p style="margin:0;color:#999;font-size:11px">Auto-sent after 3 min inactivity · <a href="https://relofinder.ch" style="color:#FF6F61">relofinder.ch</a></p>
    </div>
  </div>
</body>
</html>`;

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: 'ReloFinder AI <noreply@relofinder.ch>',
      to: ['bw@relofinder.ch'],
      subject: `Chat Session — "${firstUserMsg.slice(0, 50)}${firstUserMsg.length > 50 ? '...' : ''}"`,
      html,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Chat summary email error:', err);
    return new Response(JSON.stringify({ error: 'Email send failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
