import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { buildUserContext } from '@/services/ai-engine/contextBuilder';
import { buildSystemPrompt } from '@/services/ai-engine/promptBuilder';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    let userId = '';
    if (process.env.NODE_ENV === 'development') {
      userId = '472a3aba-5043-4720-9e79-7d8306d106a8';
    } else {
      const supabase = await createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error('Supabase Auth Error in /api/chat:', error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = session.user.id;
    }

    // Build the rich context for this specific user
    const userContext = await buildUserContext(userId);
    
    // Construct the final system prompt with guardrails and persona
    const systemPrompt = buildSystemPrompt(userContext);

    if (!process.env.GROQ_API_KEY) {
      console.error('CRITICAL: GROQ_API_KEY is undefined in environment!');
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    const customGroq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const result = streamText({
      model: customGroq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error (Sync):', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
