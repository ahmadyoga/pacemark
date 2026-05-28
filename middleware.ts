import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('pacemark_session')

  // E2E test bypass — only active when the E2E_SECRET env var is set (never in production).
  const e2eSecret = process.env.E2E_SECRET
  if (e2eSecret && request.headers.get('x-e2e-test') === e2eSecret) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname === '/' && sessionCookie) {
    return NextResponse.redirect(new URL('/picker', request.url))
  }

  if (!sessionCookie && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/picker', '/studio/:path*'],
}
