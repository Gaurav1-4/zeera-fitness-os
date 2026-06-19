import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';

async function main() {
  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: 'Hello',
  });
  
  let currentObj = result;
  let allProps = new Set();
  while (currentObj) {
    Object.getOwnPropertyNames(currentObj).forEach(prop => allProps.add(prop));
    currentObj = Object.getPrototypeOf(currentObj);
  }
  
  const functions = Array.from(allProps).filter(p => typeof result[p] === 'function');
  console.log("Functions:", functions.join(', '));
}

main().catch(console.error);
