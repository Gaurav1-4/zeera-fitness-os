import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function testGroq() {
  try {
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: 'Hello! Are you working?',
    });
    console.log('Groq Response:', text);
  } catch (err: any) {
    console.error('Groq Error:', err.message || err);
  }
}

testGroq();
