export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }

  return response.json();
}