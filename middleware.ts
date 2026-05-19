import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('pacemark_session')

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
