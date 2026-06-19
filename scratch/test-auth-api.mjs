import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function test() {
  const email = `test-${Date.now()}@example.com`
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123'
  })
  
  if (error) {
    console.error('Signup error:', error.message)
    return
  }
  
  console.log('Signed up:', email)
  
  // Wait for session
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token || data.session?.access_token
  
  if (!token) {
    console.error('No token found')
    return
  }
  
  // Create cookie array like Supabase SSR expects: ['token'] or stringified session
  const cookieValue = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]}-auth-token=${encodeURIComponent(JSON.stringify([{access_token: token, refresh_token: ''}]))}`
  
  // Now call the /api/chat endpoint
  const res = await fetch('https://zeera-fitness.vercel.app/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieValue
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'hello' }]
    })
  })
  
  console.log('Status:', res.status)
  const text = await res.text()
  console.log('Response:', text)
}

test()
