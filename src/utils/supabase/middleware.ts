import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(url, anonKey, {
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
  })

  // Get user details
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Skip middleware for static files, api routes that shouldn't be blocked, and icons
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return supabaseResponse
  }

  if (!user) {
    // If not logged in, only allow access to auth-related pages and public home
    const isAuthRoute =
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/reset-password') ||
      pathname.startsWith('/update-password') ||
      pathname === '/'

    if (!isAuthRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
  } else {
    // User is logged in
    const role = user.user_metadata?.role || 'guest'

    // Prevent logged-in users from accessing login/signup
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      const redirectUrl = request.nextUrl.clone()
      if (role === 'admin') redirectUrl.pathname = '/admin'
      else if (role === 'manager') redirectUrl.pathname = '/manager'
      else if (role === 'caretaker') redirectUrl.pathname = '/caretaker'
      else redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // Role-based route protection
    if (pathname.startsWith('/admin') && role !== 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/manager') && role !== 'manager' && role !== 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    if (pathname.startsWith('/caretaker') && role !== 'caretaker' && role !== 'admin') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}
