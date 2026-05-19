import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/?error=access_denied', request.url))
  }

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/?error=token_exchange', request.url))
  }

  const data = await tokenRes.json()
  const session = await getSession()

  session.access_token = data.access_token
  session.refresh_token = data.refresh_token
  session.expires_at = data.expires_at
  session.athlete_id = data.athlete.id
  session.athlete_name = `${data.athlete.firstname} ${data.athlete.lastname}`
  session.athlete_avatar = data.athlete.profile_medium

  await session.save()

  return NextResponse.redirect(new URL('/picker', request.url))
}
