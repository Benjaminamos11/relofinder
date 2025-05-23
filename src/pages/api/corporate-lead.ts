import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const leadData = {
      contactName: formData.get('contactName')?.toString() || '',
      jobTitle: formData.get('jobTitle')?.toString() || '',
      companyName: formData.get('companyName')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      companySize: formData.get('companySize')?.toString() || '',
      annualRelocations: formData.get('annualRelocations')?.toString() || '',
      serviceType: formData.get('serviceType')?.toString() || '',
      employeeProfile: formData.getAll('employeeProfile[]'),
      requirements: formData.get('requirements')?.toString() || '',
      type: 'corporate',
      submittedAt: new Date().toISOString(),
    };

    // Basic validation
    if (!leadData.contactName || !leadData.companyName || !leadData.email) {
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
    // 1. Save to database with confidentiality flags
    // 2. Send to CRM with corporate lead pipeline
    // 3. Send prioritized notification (corporate leads are high value)
    // 4. Schedule follow-up calls

    console.log('Corporate Lead Received:', {
      ...leadData,
      companyName: '*** CONFIDENTIAL ***', // Don't log company name for security
      email: leadData.email.split('@')[1] // Only log domain for security
    });

    // Example: Send high-priority notification
    // await sendCorporateNotification(leadData);

    // Example: Save to database with confidentiality
    // await saveCorporateLeadToDatabase(leadData);

    // Example: Add to corporate CRM pipeline
    // await addToCorporatePipeline(leadData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Thank you! Our corporate relocation specialist will contact you within 4 hours for a confidential consultation.',
      redirectUrl: '/thank-you?type=corporate'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing corporate lead:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Helper function to send high-priority corporate notification
async function sendCorporateNotification(leadData: any) {
  // Example implementation with high-priority flags
  /*
  const emailContent = `
    🔥 HIGH PRIORITY: New Corporate Relocation Lead
    
    Contact: ${leadData.contactName}
    Title: ${leadData.jobTitle}
    Company: ${leadData.companyName}
    Email: ${leadData.email}
    Company Size: ${leadData.companySize}
    Annual Volume: ${leadData.annualRelocations}
    Service Type: ${leadData.serviceType}
    Employee Profile: ${leadData.employeeProfile.join(', ')}
    Requirements: ${leadData.requirements}
    
    ⏰ FOLLOW UP: Within 4 hours
    💼 TYPE: Corporate/Enterprise
  `;

  // Send to multiple team members for corporate leads
  await emailService.send({
    to: ['corporate@relofinder.ch', 'sales@relofinder.ch'],
    subject: '🔥 URGENT: New Corporate Relocation Lead',
    text: emailContent,
    priority: 'high'
  });

  // Also send SMS/Slack notification for immediate attention
  // await sendSlackAlert(leadData);
  */
}

// Helper function for corporate CRM integration
async function addToCorporatePipeline(leadData: any) {
  // Example with HubSpot/Pipedrive/Salesforce
  /*
  await crm.contacts.create({
    email: leadData.email,
    firstname: leadData.contactName.split(' ')[0],
    lastname: leadData.contactName.split(' ').slice(1).join(' '),
    company: leadData.companyName,
    jobtitle: leadData.jobTitle,
    lifecyclestage: 'lead',
    lead_source: 'Website - Corporate Form',
    company_size: leadData.companySize,
    annual_relocations: leadData.annualRelocations,
    service_type_needed: leadData.serviceType,
    employee_profiles: leadData.employeeProfile.join(', '),
    special_requirements: leadData.requirements,
    lead_score: 90, // High score for corporate leads
    priority: 'high'
  });
  */
}

// Helper function to save corporate lead with confidentiality
async function saveCorporateLeadToDatabase(leadData: any) {
  // Example with encrypted storage for sensitive corporate data
  /*
  const encryptedData = {
    ...leadData,
    companyName: encrypt(leadData.companyName),
    email: encrypt(leadData.email),
    requirements: encrypt(leadData.requirements),
    confidential: true,
    leadScore: 90,
    priority: 'high'
  };

  const { error } = await supabase
    .from('corporate_leads')
    .insert([encryptedData]);
    
  if (error) throw error;
  */
} 