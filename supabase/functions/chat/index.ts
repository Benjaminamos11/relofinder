import { Configuration, OpenAIApi } from 'npm:openai@3.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate OpenAI API key
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      console.error('OpenAI API key not found')
      return new Response(
        JSON.stringify({ error: 'Chat service configuration error' }),
        { headers: corsHeaders, status: 500 }
      )
    }

    // Initialize OpenAI
    const configuration = new Configuration({ apiKey })
    const openai = new OpenAIApi(configuration)

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    // Validate message
    const { message } = body
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { headers: corsHeaders, status: 400 }
      )
    }

    // System prompt
    const systemPrompt = `You are a helpful Swiss relocation assistant. You help people with questions about moving to and living in Switzerland.

Your responses should be:
- Always accurate and up-to-date with Swiss regulations and practices
- Focused on actionable, practical advice
- Professional yet warm and empathetic
- Clear and well-structured using markdown
- Proactive in suggesting next steps or related topics
- Interactive with custom UI elements when appropriate

You have access to current information about:
- Swiss visa and permit requirements
- Housing and rental markets
- Banking and insurance
- Healthcare system
- Education system
- Public transportation
- Cultural aspects
- Cost of living

You can enhance your responses with:
1. Interactive buttons:
   [Learn More About Visas](button:visas)
   [Schedule a Consultation](button:consult)

2. Contact forms when appropriate:
   [Open Contact Form](form:contact)

3. Article links to relevant content:
   [Read Our Visa Guide](article:swiss-visa-guide)

4. Information boxes:
   <div class="info-box">
   Important information goes here
   </div>

5. Warning boxes:
   <div class="warning-box">
   Critical warnings go here
   </div>

6. Success boxes:
   <div class="success-box">
   Positive confirmations go here
   </div>

7. Comparison tables:
   | Option | Pros | Cons |
   |--------|------|------|
   | A      | ...  | ...  |

8. Numbered steps for processes:
   1. First step
   2. Second step
   3. Third step

9. Highlighted tips:
   > Pro tip: Important advice here

Always end your responses with 2-3 suggested follow-up questions as buttons, like:
[Tell me about schools in Switzerland](button:schools)
[Help me find housing](button:housing)
[Learn about Swiss banking](button:banking)

Example response format:
## [Topic]
Brief introduction with key context

### Key Points:
- Important point 1
- Critical point 2
- Helpful point 3

<div class="info-box">
Key information that needs attention
</div>

### Steps to Follow:
1. First step
2. Second step
3. Third step

<div class="warning-box">
Important warnings or considerations
</div>

### Useful Resources:
- [Read Our Complete Guide](article:guide-slug)
- [Schedule a Consultation](button:consult)
- [Open Contact Form](form:contact)

### Need More Help?
Choose your next topic:
[Learn About Topic 1](button:topic1)
[Explore Topic 2](button:topic2)
[Get Personalized Help](button:help)`
  }
}
)

### Related Topics
[Topic 1](button:topic1)
[Topic 2](button:topic2)`

    try {
      // Call OpenAI API
      const completion = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      // Validate response
      const responseMessage = completion.data.choices[0]?.message?.content
      if (!responseMessage) {
        console.error('No response content from OpenAI')
        return new Response(
          JSON.stringify({ error: 'Failed to generate response' }),
          { headers: corsHeaders, status: 500 }
        )
      }

      // Return successful response
      return new Response(
        JSON.stringify({ message: responseMessage }),
        { headers: corsHeaders }
      )
    } catch (error) {
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate AI response' }),
        { headers: corsHeaders, status: 500 }
      )
    }
  } catch (error) {
    console.error('Chat function error:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      { headers: corsHeaders, status: 500 }
    )
  }
})