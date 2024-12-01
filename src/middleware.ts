import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect to auth page if accessing protected routes without session
  if (!session && (
    req.nextUrl.pathname.startsWith('/dashboard') || 
    req.nextUrl.pathname === '/'
  )) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Redirect to dashboard if accessing auth page with session
  if (session && req.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/auth', '/dashboard/:path*', '/auth/callback']
} 