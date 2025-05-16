import { Configuration, OpenAIApi } from 'npm:openai@3.3.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const configuration = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
})

const openai = new OpenAIApi(configuration)

const systemPrompt = `You are a helpful Swiss relocation assistant. You help people with questions about moving to and living in Switzerland.
Your responses should be:
- Accurate and up-to-date
- Focused on practical advice
- Professional but friendly
- Concise but informative

You have access to current information about:
- Swiss visa and permit requirements
- Housing and rental markets
- Banking and insurance
- Healthcare system
- Education system
- Public transportation
- Cultural aspects
- Cost of living

If asked about specific service providers or making recommendations, encourage users to explore options on ReloFinder.ch.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.data.choices[0].message?.content || 'I apologize, but I am unable to provide an answer at this moment.'

    return new Response(
      JSON.stringify({ message: response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})