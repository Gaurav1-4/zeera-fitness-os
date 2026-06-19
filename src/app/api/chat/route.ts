import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { buildUserContext } from '@/services/ai-engine/contextBuilder';
import { buildSystemPrompt } from '@/services/ai-engine/promptBuilder';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Determine the user ID using the bypass token or Supabase Auth
    const cookieStore = await cookies();
    const bypassToken = cookieStore.get('sb-bypass-token')?.value;

    let userId: string;

    if (bypassToken) {
      userId = '472a3aba-5043-4720-9e79-7d8306d106a8';
    } else {
      const supabase = await createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.error('Supabase Auth Error in /api/chat:', error);
        userId = '472a3aba-5043-4720-9e79-7d8306d106a8'; // Fallback to MOCK_USER
      } else {
        userId = session.user.id;
      }
    }

    // Build the rich context for this specific user
    const userContext = await buildUserContext(userId);
    
    // Construct the final system prompt with guardrails and persona
    const systemPrompt = buildSystemPrompt(userContext);

    // Call Groq and stream the response
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    // Use toUIMessageStreamResponse — this is the format the @ai-sdk/react
    // useChat hook's DefaultChatTransport expects in SDK v6.
    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
