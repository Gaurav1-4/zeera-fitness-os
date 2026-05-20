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

  // 1. Fast path: Public API routes and static assets bypass auth verification entirely
  if (
    pathname.startsWith('/api/exercises') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.')
  ) {
    return supabaseResponse
  }

  // 2. Pre-flight session cookie check
  // Avoid checking auth via network if the user doesn't even have a Supabase session cookie.
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(c => 
    c.name.startsWith('sb-') || 
    c.name.includes('supabase') || 
    c.name.includes('auth-token')
  )

  const isLoginOrSignup = pathname.startsWith('/login') || pathname.startsWith('/signup')

  // If no auth cookie exists, we don't need to make any network call
  if (!hasAuthCookie) {
    if (!isLoginOrSignup) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
    return supabaseResponse
  }

  // 3. Authenticated check (runs ONLY if session cookie is present)
  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isLoginOrSignup) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isLoginOrSignup) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/home'
      return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
