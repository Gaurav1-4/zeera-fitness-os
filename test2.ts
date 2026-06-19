import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';

async function main() {
  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    prompt: 'hello',
  });
  let props = [];
  for (let obj = result; obj; obj = Object.getPrototypeOf(obj)) {
    props.push(...Object.getOwnPropertyNames(obj));
  }
  console.log(props);
}
main();
