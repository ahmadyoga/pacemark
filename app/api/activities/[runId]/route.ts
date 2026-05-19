import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  refreshAccessToken,
  getActivityFromStrava,
  toDisplayActivity,
} from '@/lib/strava'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params
  const id = parseInt(runId, 10)

  if (isNaN(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  const session = await getSession()

  if (!session.access_token || !session.refresh_token || !session.expires_at) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  if (Date.now() / 1000 >= session.expires_at - 60) {
    try {
      const tokens = await refreshAccessToken(session.refresh_token)
      session.access_token = tokens.access_token
      session.refresh_token = tokens.refresh_token
      session.expires_at = tokens.expires_at
      await session.save()
    } catch {
      return NextResponse.json({ error: 'token_refresh_failed' }, { status: 401 })
    }
  }

  try {
    const activity = await getActivityFromStrava(session.access_token, id)
    return NextResponse.json(toDisplayActivity(activity))
  } catch {
    return NextResponse.json({ error: 'strava_error' }, { status: 502 })
  }
}
