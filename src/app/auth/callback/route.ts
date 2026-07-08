import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if user has a role and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role || 'guest'
      
      let redirectPath = next
      if (next === '/') {
        if (role === 'admin') redirectPath = '/admin'
        else if (role === 'manager') redirectPath = '/manager'
        else if (role === 'caretaker') redirectPath = '/caretaker'
        else redirectPath = '/dashboard'
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  // Return the user to a login page with an error
  return NextResponse.redirect(`${origin}/login?error=auth-code-exchange-failed`)
}
