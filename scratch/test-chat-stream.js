import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

async function test() {
  try {
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: "Hello",
      messages: [{ role: "user", content: "Hi" }],
      temperature: 0.7,
    });
    const response = result.toUIMessageStreamResponse();
    const text = await response.text();
    console.log("Stream body:", text);
  } catch (e) {
    console.error("Stream Error:", e);
  }
}
test();
