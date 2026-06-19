import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return supabaseResponse

  const { pathname } = request.nextUrl

  const isLoginOrSignup = pathname.startsWith('/login') || pathname.startsWith('/signup')

  // Check for local auth bypass
  const hasBypass = request.cookies.get('sb-bypass-token')
  if (hasBypass) {
    if (isLoginOrSignup) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/home'
      return NextResponse.redirect(redirectUrl)
    }
    return supabaseResponse
  }

  // 1. Fast path: Public routes bypass auth entirely
  if (
    pathname.startsWith('/api/exercises') ||
    pathname.startsWith('/api/chat') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.')
  ) {
    return supabaseResponse
  }

  // 2. Pre-flight cookie check — no cookie = no session, skip network
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(c => 
    c.name.startsWith('sb-') || 
    c.name.includes('supabase') || 
    c.name.includes('auth-token')
  )

  if (!hasAuthCookie) {
    if (!isLoginOrSignup) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
    return supabaseResponse
  }

  // 3. Session check using LOCAL JWT (no network call)
  // getSession() reads the JWT from the cookie — instant, zero latency.
  // getUser() would call Supabase servers on every navigation = 1-2s delay.
  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fast local JWT check — no network roundtrip
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session && !isLoginOrSignup) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  if (session && isLoginOrSignup) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/home'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
