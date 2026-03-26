import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function POST(request: Request) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    return NextResponse.json({ 
      brief: 'AI Brief unavailable — GROQ_API_KEY not configured.',
      model: 'none'
    });
  }

  try {
    const body = await request.json();
    const events = body.events || [];

    // Build a concise list of active events
    const eventSummary = events
      .slice(0, 10)
      .map((e: any, i: number) => (i + 1) + '. ' + e.title + ' (' + e.source + ', severity ' + e.severity + '/5)')
      .join('\n');

    const prompt = 'You are an intelligence analyst.\n\nHere are the current active disaster events:\n' + eventSummary + '\n\nProvide a 3-sentence intelligence briefing summarizing the current global disaster situation. Be concise, factual, and use present tense. Focus on the most critical events and regional patterns.';

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + GROQ_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a disaster intelligence analyst. Respond with exactly 3 sentences.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[AI Brief] Groq API error:', err);
      return NextResponse.json({ brief: 'AI analysis temporarily unavailable.', model: 'error' });
    }

    const data = await res.json();
    const brief = data.choices?.[0]?.message?.content || 'No analysis generated.';

    return NextResponse.json({ 
      brief,
      model: data.model || 'llama-3.1-70b-versatile',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[AI Brief] Error:', error);
    return NextResponse.json({ brief: 'AI analysis failed. Check API key.', model: 'error' });
  }
}
