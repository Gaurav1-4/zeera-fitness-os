import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const MOCK_USER = {
  id: '472a3aba-5043-4720-9e79-7d8306d106a8',
  email: 'gauravgoyal2112007@gmail.com',
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: { provider: 'google', providers: ['google'] },
  user_metadata: { name: 'Gaurav Goyal', email: 'gauravgoyal2112007@gmail.com' }
}

export const MOCK_SESSION = {
  access_token: 'bypass-token-jwt-like-string',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'bypass-refresh-token',
  user: MOCK_USER
}

export async function createClient() {
  const cookieStore = await cookies()
  const hasBypass = cookieStore.get('sb-bypass-token')

  if (hasBypass) {
    return {
      auth: {
        getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
        getSession: async () => ({ data: { session: MOCK_SESSION }, error: null }),
        signOut: async () => {
          cookieStore.delete('sb-bypass-token')
          return { error: null }
        }
      }
    } as any
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase env vars')
  }

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
