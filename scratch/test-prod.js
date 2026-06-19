const fetch = require('node-fetch');

async function test() {
  const res = await fetch('https://zeera-fitness.vercel.app/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Cookie': 'sb-bypass-token=test' // DO NOT use bypass token to simulate actual user flow
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'hi' }]
    })
  });
  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Body: ${text}`);
}

test();
