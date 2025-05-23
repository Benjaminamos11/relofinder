import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const leadData = {
      firstName: formData.get('firstName')?.toString() || '',
      lastName: formData.get('lastName')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      movingFrom: formData.get('movingFrom')?.toString() || '',
      movingTo: formData.get('movingTo')?.toString() || '',
      timeline: formData.get('timeline')?.toString() || '',
      budget: formData.get('budget')?.toString() || '',
      services: formData.getAll('services[]'),
      details: formData.get('details')?.toString() || '',
      type: 'individual',
      submittedAt: new Date().toISOString(),
    };

    // Basic validation
    if (!leadData.firstName || !leadData.lastName || !leadData.email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Required fields missing' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid email format' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // TODO: Integrate with your preferred solution:
    // 1. Save to database (Supabase/PostgreSQL)
    // 2. Send to CRM (HubSpot, Pipedrive, etc.)
    // 3. Send notification email
    // 4. Add to mailing list

    console.log('Individual Lead Received:', leadData);

    // Example: Send notification email (implement with your email service)
    // await sendNotificationEmail(leadData);

    // Example: Save to database
    // await saveLeadToDatabase(leadData);

    // For now, log and return success
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Thank you! We\'ll contact you within 24 hours with personalized recommendations.',
      redirectUrl: '/thank-you?type=individual'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing individual lead:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Helper function to send notification email (implement with your email service)
async function sendNotificationEmail(leadData: any) {
  // Example implementation with Resend/SendGrid/etc.
  /*
  const emailContent = `
    New Individual Relocation Lead:
    
    Name: ${leadData.firstName} ${leadData.lastName}
    Email: ${leadData.email}
    Moving From: ${leadData.movingFrom}
    Moving To: ${leadData.movingTo}
    Timeline: ${leadData.timeline}
    Budget: ${leadData.budget}
    Services: ${leadData.services.join(', ')}
    Details: ${leadData.details}
  `;

  await emailService.send({
    to: 'leads@relofinder.ch',
    subject: 'New Individual Relocation Lead',
    text: emailContent
  });
  */
}

// Helper function to save to database (implement with your database)
async function saveLeadToDatabase(leadData: any) {
  // Example with Supabase
  /*
  const { error } = await supabase
    .from('leads')
    .insert([leadData]);
    
  if (error) throw error;
  */
} 