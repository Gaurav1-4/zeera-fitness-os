import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testProdApi() {
  console.log('Authenticating with Supabase...');
  
  // Create a test user or login
  const testEmail = 'test_api_coach@example.com';
  const testPassword = 'TestPassword123!';
  
  let { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (error || !data.session) {
    console.log('Login failed, trying to sign up instead...');
    const signup = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    if (signup.error) {
      console.error('Signup failed:', signup.error.message);
      return;
    }
    data = signup.data;
  }
  
  if (!data.session) {
    console.error('Could not get session after auth.');
    return;
  }

  const token = data.session.access_token;
  const refreshToken = data.session.refresh_token;
  console.log('Authentication successful. Testing /api/chat endpoint...');

  const cookieStr = `sb-zzwyxdegwtpsuipfvbch-auth-token=["${token}","${refreshToken}"];`;

  const response = await fetch('https://zeera-fitness.vercel.app/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieStr,
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hi coach, this is a test!' }]
    })
  });

  console.log(`Response Status: ${response.status}`);
  console.log('Response Headers:', response.headers);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;

  console.log('--- Stream Data ---');
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      process.stdout.write(decoder.decode(value));
    }
  }
  console.log('\n--- End of Stream ---');
}

testProdApi().catch(console.error);
