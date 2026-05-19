import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()

  if (!session.athlete_id) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  return NextResponse.json({
    id: session.athlete_id,
    name: session.athlete_name,
    avatar: session.athlete_avatar,
  })
}
