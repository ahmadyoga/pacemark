# Pacemark Next.js Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Migrate Pacemark from a vanilla HTML/CDN-React prototype to a production Next.js 15 app with real Strava OAuth, live activity data, and functional PNG/clipboard sticker export deployed on Vercel.

**Architecture:** Next.js 15 App Router with TypeScript. API routes handle Strava OAuth token exchange server-side; tokens live in encrypted HTTP-only iron-session cookies. Activity data flows through proxy API routes so tokens never reach the client. Sticker PNG export uses html2canvas on a hidden off-screen render target; same blob goes to clipboard or file download.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v3, iron-session v8, html2canvas, Jest + @testing-library/react

---

## File Map

```
app/
  layout.tsx                          Root layout — fonts, html/body
  page.tsx                            Landing screen ("use client")
  picker/
    page.tsx                          Activity picker ("use client", protected)
  studio/
    [runId]/
      page.tsx                        Sticker studio ("use client", protected)
  api/
    auth/
      strava/route.ts                 GET — redirect to Strava OAuth
      callback/route.ts               GET — exchange code → tokens, set cookie
    activities/
      route.ts                        GET — proxy Strava activities list
      [runId]/route.ts                GET — proxy single Strava activity

components/
  stickers/
    types.ts                          VisibleMetrics, StickerProps, StickerDef, VISIBLE_LABELS, statList
    index.ts                          re-exports types.ts + STICKER_DEFS
    StickerBigNumber.tsx
    StickerBoldCaps.tsx
    StickerMonoBlock.tsx
    StickerSerif.tsx
    StickerCapsule.tsx
    StickerChat.tsx
  ui/
    RouteLine.tsx                     SVG route polyline
    MiniMap.tsx                       Grid + RouteLine in a box
    RunCard.tsx                       Activity card for picker list
    StickerTile.tsx                   Sticker preview + hidden capture + Copy/PNG buttons

lib/
  strava.ts                           Types, formatters, API client, token refresh
  session.ts                          iron-session config + getSession()
  export.ts                           stickerToBlob, downloadBlob, copyBlobToClipboard

middleware.ts                         Edge auth guard — /picker and /studio/**
tailwind.config.ts                    Custom design tokens
app/globals.css                       CSS variables + base reset

__tests__/
  lib/strava.test.ts
  lib/export.test.ts
  middleware.test.ts
  api/activities.test.ts
  components/StickerBigNumber.test.tsx
  components/StickerTile.test.tsx
```

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: all scaffold files via `create-next-app`
- Create: `.env.local.example`
- Create: `jest.config.ts`, `jest.setup.ts`

- [x] **Step 1: Scaffold Next.js app into current directory**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

Answer prompts: Yes to TypeScript, Yes to ESLint, Yes to Tailwind, No to `src/` dir, Yes to App Router, `@/*` for import alias.

- [x] **Step 2: Install runtime dependencies**

```bash
npm install iron-session html2canvas
```

- [x] **Step 3: Install test dependencies**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

- [x] **Step 4: Create jest.config.ts**

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

- [x] **Step 5: Create jest.setup.ts**

```ts
import '@testing-library/jest-dom'
```

- [x] **Step 6: Add test script to package.json**

In `package.json` `scripts` section, add:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [x] **Step 7: Create .env.local.example**

```
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
SESSION_PASSWORD=change_me_to_at_least_32_random_characters
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- [x] **Step 8: Add .env.local to .gitignore**

Verify `.gitignore` contains `.env.local` (create-next-app adds it by default). Also add:
```
.env.local
```

- [x] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 15 project with jest"
```

---

## Task 2: Design tokens + global styles

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

*No unit tests — configuration only.*

- [x] **Step 1: Replace tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-2': 'var(--bg-2)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--line)',
        'line-2': 'var(--line-2)',
        foreground: 'var(--text)',
        muted: 'var(--text-mute)',
        dim: 'var(--text-dim)',
        accent: 'var(--accent)',
        strava: 'var(--strava)',
        good: 'var(--good)',
      },
      fontFamily: {
        ui: ['var(--font-ui)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-display)'],
        serif: ['var(--font-serif)'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '28px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [x] **Step 2: Replace app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&family=Archivo+Black&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #0a0a0b;
  --bg-2: #111114;
  --surface: #16161a;
  --surface-2: #1c1c22;
  --line: #26262e;
  --line-2: #34343e;
  --text: #f5f4f1;
  --text-mute: #a1a1aa;
  --text-dim: #6b6b75;
  --accent: #ff5a1f;
  --strava: #FC4C02;
  --good: #22d3a0;

  --font-ui: 'Inter', 'Helvetica Neue', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-display: 'Inter Tight', 'Inter', sans-serif;
  --font-serif: 'Instrument Serif', Georgia, serif;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

body { overflow-x: hidden; }

button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
}

button:disabled { cursor: not-allowed; }
```

- [x] **Step 3: Update app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pacemark — running sticker generator',
  description: 'Turn your runs into shareable Instagram stickers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [x] **Step 4: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts on http://localhost:3000 with no errors.

- [x] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css app/layout.tsx
git commit -m "style: add design tokens and global CSS"
```

---

## Task 3: Strava types + metric formatters

**Files:**
- Create: `lib/strava.ts`
- Create: `__tests__/lib/strava.test.ts`

- [x] **Step 1: Write failing tests**

Create `__tests__/lib/strava.test.ts`:

```ts
import {
  formatDuration,
  formatPace,
  formatDistance,
  toDisplayActivity,
  type ActivitySummary,
} from '@/lib/strava'

describe('formatDuration', () => {
  it('formats seconds under 1 hour as mm:ss', () => {
    expect(formatDuration(3252)).toBe('54:12')
  })
  it('formats seconds over 1 hour as h:mm:ss', () => {
    expect(formatDuration(7412)).toBe('2:03:32')
  })
  it('pads minutes and seconds', () => {
    expect(formatDuration(65)).toBe('1:05')
  })
})

describe('formatPace', () => {
  it('converts m/s to min:sec per km', () => {
    // 3.0 m/s = 333.3 sec/km = 5:33
    expect(formatPace(3.0)).toBe('5:33')
  })
  it('returns --:-- for zero speed', () => {
    expect(formatPace(0)).toBe('--:--')
  })
})

describe('formatDistance', () => {
  it('converts meters to km with 1 decimal', () => {
    expect(formatDistance(10200)).toBe('10.2')
  })
  it('rounds correctly', () => {
    expect(formatDistance(6400)).toBe('6.4')
  })
})

describe('toDisplayActivity', () => {
  const base: ActivitySummary = {
    id: 7,
    name: 'Morning Run',
    sport_type: 'Run',
    start_date: '2026-05-17T03:00:00Z',
    distance: 10200,
    moving_time: 3252,
    total_elevation_gain: 88,
    average_speed: 3.0,
    average_heartrate: 142,
    kilojoules: 612,
  }

  it('formats distance', () => {
    expect(toDisplayActivity(base).distance).toBe('10.2')
  })
  it('formats duration', () => {
    expect(toDisplayActivity(base).duration).toBe('54:12')
  })
  it('formats heartRate', () => {
    expect(toDisplayActivity(base).heartRate).toBe('142')
  })
  it('formats elevation', () => {
    expect(toDisplayActivity(base).elevation).toBe('88')
  })
  it('uses -- when heartRate is missing', () => {
    expect(toDisplayActivity({ ...base, average_heartrate: undefined }).heartRate).toBe('--')
  })
})
```

- [x] **Step 2: Run tests — verify they fail**

```bash
npm test -- --testPathPattern=strava --verbose
```

Expected: `Cannot find module '@/lib/strava'`

- [x] **Step 3: Create lib/strava.ts**

```ts
export interface ActivitySummary {
  id: number
  name: string
  sport_type: string
  start_date: string
  distance: number
  moving_time: number
  total_elevation_gain: number
  average_speed: number
  average_heartrate?: number
  kilojoules?: number
  location_city?: string
  location_country?: string
}

export interface DisplayActivity {
  id: number
  title: string
  date: string
  distance: string
  pace: string
  duration: string
  heartRate: string
  elevation: string
  calories: string
  city: string
  routeSeed: number
  fresh: boolean
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatPace(metersPerSecond: number): string {
  if (metersPerSecond === 0) return '--:--'
  const secsPerKm = 1000 / metersPerSecond
  const m = Math.floor(secsPerKm / 60)
  const s = Math.round(secsPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(1)
}

export function toDisplayActivity(a: ActivitySummary): DisplayActivity {
  const date = new Date(a.start_date)
  return {
    id: a.id,
    title: a.name,
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    distance: formatDistance(a.distance),
    pace: formatPace(a.average_speed),
    duration: formatDuration(a.moving_time),
    heartRate: a.average_heartrate ? String(Math.round(a.average_heartrate)) : '--',
    elevation: String(Math.round(a.total_elevation_gain)),
    calories: a.kilojoules ? String(Math.round(a.kilojoules)) : '--',
    city: a.location_city || a.location_country || 'Unknown',
    routeSeed: (a.id % 10) + 0.1,
    fresh: Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000,
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  expires_at: number
}> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) throw new Error('refresh_failed')
  return res.json()
}

export async function getActivitiesFromStrava(
  accessToken: string,
  perPage = 30
): Promise<ActivitySummary[]> {
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error('strava_api_error')
  return res.json()
}

export async function getActivityFromStrava(
  accessToken: string,
  id: number
): Promise<ActivitySummary> {
  const res = await fetch(`https://www.strava.com/api/v3/activities/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('strava_api_error')
  return res.json()
}
```

- [x] **Step 4: Run tests — verify they pass**

```bash
npm test -- --testPathPattern=strava --verbose
```

Expected: all 8 tests pass.

- [x] **Step 5: Commit**

```bash
git add lib/strava.ts __tests__/lib/strava.test.ts
git commit -m "feat: add Strava types, formatters, and API client"
```

---

## Task 4: Session lib

**Files:**
- Create: `lib/session.ts`

*No unit tests — iron-session wrapper with no logic to isolate.*

- [x] **Step 1: Create lib/session.ts**

```ts
import { getIronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  access_token?: string
  refresh_token?: string
  expires_at?: number
  athlete_id?: number
  athlete_name?: string
  athlete_avatar?: string
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: 'pacemark_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
```

- [x] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add lib/session.ts
git commit -m "feat: add iron-session helper"
```

---

## Task 5: Strava OAuth API routes

**Files:**
- Create: `app/api/auth/strava/route.ts`
- Create: `app/api/auth/callback/route.ts`

*Manual test via browser — OAuth redirect can't be unit tested without a live Strava client.*

- [x] **Step 1: Create app/api/auth/strava/route.ts**

```ts
import { NextResponse } from 'next/server'

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'activity:read_all',
  })
  return NextResponse.redirect(
    `https://www.strava.com/oauth/authorize?${params.toString()}`
  )
}
```

- [x] **Step 2: Create app/api/auth/callback/route.ts**

```ts
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
```

- [x] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [x] **Step 4: Commit**

```bash
git add app/api/auth/
git commit -m "feat: add Strava OAuth redirect and callback routes"
```

---

## Task 6: Activity proxy API routes

**Files:**
- Create: `app/api/activities/route.ts`
- Create: `app/api/activities/[runId]/route.ts`
- Create: `__tests__/api/activities.test.ts`

- [x] **Step 1: Write failing tests**

Create `__tests__/api/activities.test.ts`:

```ts
import { GET } from '@/app/api/activities/route'
import { NextRequest } from 'next/server'

// Mock iron-session
jest.mock('@/lib/session', () => ({
  getSession: jest.fn(),
}))

// Mock strava client
jest.mock('@/lib/strava', () => ({
  ...jest.requireActual('@/lib/strava'),
  refreshAccessToken: jest.fn(),
  getActivitiesFromStrava: jest.fn(),
}))

import { getSession } from '@/lib/session'
import { refreshAccessToken, getActivitiesFromStrava } from '@/lib/strava'

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockRefresh = refreshAccessToken as jest.MockedFunction<typeof refreshAccessToken>
const mockGetActivities = getActivitiesFromStrava as jest.MockedFunction<typeof getActivitiesFromStrava>

function makeRequest() {
  return new NextRequest('http://localhost:3000/api/activities')
}

describe('GET /api/activities', () => {
  it('returns 401 when session has no token', async () => {
    mockGetSession.mockResolvedValue({ access_token: undefined } as any)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns activities when token is fresh', async () => {
    mockGetSession.mockResolvedValue({
      access_token: 'tok',
      refresh_token: 'ref',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      save: jest.fn(),
    } as any)
    mockGetActivities.mockResolvedValue([{
      id: 1,
      name: 'Test Run',
      sport_type: 'Run',
      start_date: '2026-05-17T03:00:00Z',
      distance: 10200,
      moving_time: 3252,
      total_elevation_gain: 88,
      average_speed: 3.0,
    }])
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].distance).toBe('10.2')
  })

  it('refreshes token when expired', async () => {
    const mockSave = jest.fn()
    mockGetSession.mockResolvedValue({
      access_token: 'old_tok',
      refresh_token: 'ref',
      expires_at: Math.floor(Date.now() / 1000) - 10,
      save: mockSave,
    } as any)
    mockRefresh.mockResolvedValue({
      access_token: 'new_tok',
      refresh_token: 'new_ref',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    })
    mockGetActivities.mockResolvedValue([])
    await GET()
    expect(mockRefresh).toHaveBeenCalledWith('ref')
    expect(mockSave).toHaveBeenCalled()
  })
})
```

- [x] **Step 2: Run tests — verify they fail**

```bash
npm test -- --testPathPattern=activities --verbose
```

Expected: `Cannot find module '@/app/api/activities/route'`

- [x] **Step 3: Create app/api/activities/route.ts**

```ts
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  refreshAccessToken,
  getActivitiesFromStrava,
  toDisplayActivity,
} from '@/lib/strava'

export async function GET() {
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
    const activities = await getActivitiesFromStrava(session.access_token)
    return NextResponse.json(activities.map(toDisplayActivity))
  } catch {
    return NextResponse.json({ error: 'strava_error' }, { status: 502 })
  }
}
```

- [x] **Step 4: Create app/api/activities/[runId]/route.ts**

```ts
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
```

- [x] **Step 5: Run tests — verify they pass**

```bash
npm test -- --testPathPattern=activities --verbose
```

Expected: all 3 tests pass.

- [x] **Step 6: Commit**

```bash
git add app/api/activities/ __tests__/api/
git commit -m "feat: add activity proxy API routes with token refresh"
```

---

## Task 7: Middleware auth guard

**Files:**
- Create: `middleware.ts`
- Create: `__tests__/middleware.test.ts`

- [x] **Step 1: Write failing tests**

Create `__tests__/middleware.test.ts`:

```ts
import { middleware } from '@/middleware'
import { NextRequest } from 'next/server'

function makeRequest(path: string, hasCookie = false) {
  const req = new NextRequest(`http://localhost:3000${path}`)
  if (hasCookie) {
    req.cookies.set('pacemark_session', 'some_value')
  }
  return req
}

describe('middleware', () => {
  it('redirects /picker to / when no session cookie', async () => {
    const res = await middleware(makeRequest('/picker'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/')
  })

  it('redirects /studio/123 to / when no session cookie', async () => {
    const res = await middleware(makeRequest('/studio/123'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/')
  })

  it('allows /picker through when session cookie exists', async () => {
    const res = await middleware(makeRequest('/picker', true))
    expect(res.status).toBe(200)
  })
})
```

- [x] **Step 2: Run tests — verify they fail**

```bash
npm test -- --testPathPattern=middleware --verbose
```

Expected: `Cannot find module '@/middleware'`

- [x] **Step 3: Create middleware.ts**

```ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('pacemark_session')
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/picker', '/studio/:path*'],
}
```

- [x] **Step 4: Run tests — verify they pass**

```bash
npm test -- --testPathPattern=middleware --verbose
```

Expected: all 3 tests pass.

- [x] **Step 5: Commit**

```bash
git add middleware.ts __tests__/middleware.test.ts
git commit -m "feat: add edge middleware auth guard"
```

---

## Task 8: Shared UI components

**Files:**
- Create: `components/ui/RouteLine.tsx`
- Create: `components/ui/MiniMap.tsx`

*No unit tests — pure visual SVG components.*

- [x] **Step 1: Create components/ui/RouteLine.tsx**

```tsx
interface RouteLineProps {
  seed?: number
  stroke?: string
  strokeWidth?: number
  opacity?: number
  height?: number
}

export function RouteLine({
  seed = 1,
  stroke = 'currentColor',
  strokeWidth = 2,
  opacity = 1,
  height = 36,
}: RouteLineProps) {
  const points: string[] = []
  const N = 22
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const wob = Math.sin(t * 6 + seed) * 12 + Math.cos(t * 9 + seed * 1.3) * 5
    const x = 6 + t * 88
    const y = 50 + wob
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  const first = points[0].split(',')
  const last = points[points.length - 1].split(',')

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block', opacity }}
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={first[0]} cy={first[1]} r="2.5" fill={stroke} />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={stroke} />
    </svg>
  )
}
```

- [x] **Step 2: Create components/ui/MiniMap.tsx**

```tsx
import { RouteLine } from './RouteLine'

interface MiniMapProps {
  seed?: number
  accent?: string
}

export function MiniMap({ seed = 1, accent = '#FF5A1F' }: MiniMapProps) {
  return (
    <div
      style={{
        width: 84,
        height: 76,
        borderRadius: 10,
        background: '#0d0d10',
        border: '1px solid var(--line)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />
      <div style={{ position: 'absolute', inset: 8 }}>
        <RouteLine seed={seed} stroke={accent} strokeWidth={2.2} />
      </div>
    </div>
  )
}
```

- [x] **Step 3: Commit**

```bash
git add components/ui/RouteLine.tsx components/ui/MiniMap.tsx
git commit -m "feat: add RouteLine and MiniMap UI components"
```

---

## Task 9: Sticker components

**Files:**
- Create: `components/stickers/types.ts`
- Create: `components/stickers/index.ts`
- Create: `components/stickers/StickerBigNumber.tsx`
- Create: `components/stickers/StickerBoldCaps.tsx`
- Create: `components/stickers/StickerMonoBlock.tsx`
- Create: `components/stickers/StickerSerif.tsx`
- Create: `components/stickers/StickerCapsule.tsx`
- Create: `components/stickers/StickerChat.tsx`
- Create: `__tests__/components/StickerBigNumber.test.tsx`

- [x] **Step 1: Write failing test**

Create `__tests__/components/StickerBigNumber.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { StickerBigNumber } from '@/components/stickers/StickerBigNumber'
import type { DisplayActivity } from '@/lib/strava'

const run: DisplayActivity = {
  id: 1, title: 'Morning Run', date: 'May 17',
  distance: '10.2', pace: '5:32', duration: '54:12',
  heartRate: '142', elevation: '88', calories: '612',
  city: 'Jakarta', routeSeed: 3.1, fresh: true,
}

const visible = {
  distance: true, pace: true, duration: true,
  heartRate: false, elevation: true, calories: false, city: true,
}

describe('StickerBigNumber', () => {
  it('renders the distance as hero number', () => {
    render(<StickerBigNumber run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('10.2')).toBeInTheDocument()
  })

  it('shows pace when visible', () => {
    render(<StickerBigNumber run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('5:32/km')).toBeInTheDocument()
  })
})
```

- [x] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern=StickerBigNumber --verbose
```

Expected: `Cannot find module '@/components/stickers/StickerBigNumber'`

- [x] **Step 3: Create components/stickers/types.ts**

Types and utilities extracted into a separate file so sticker components can import from here without creating a circular dependency with `index.ts`.

```ts
import type { DisplayActivity } from '@/lib/strava'
import type { ComponentType } from 'react'

export interface VisibleMetrics {
  distance: boolean
  pace: boolean
  duration: boolean
  heartRate: boolean
  elevation: boolean
  calories: boolean
  city: boolean
}

export interface StickerProps {
  run: DisplayActivity
  visible: VisibleMetrics
  accent: string
}

export interface StickerDef {
  id: string
  name: string
  desc: string
  comp: ComponentType<StickerProps>
}

export const VISIBLE_LABELS: Record<keyof VisibleMetrics, string> = {
  distance: 'Distance',
  pace: 'Pace',
  duration: 'Duration',
  heartRate: 'Heart Rate',
  elevation: 'Elevation',
  calories: 'Calories',
  city: 'City',
}

export function statList(
  run: DisplayActivity,
  visible: VisibleMetrics
): [string, string][] {
  const arr: [string, string][] = []
  if (visible.distance) arr.push(['DIST', `${run.distance} km`])
  if (visible.pace) arr.push(['PACE', `${run.pace}/km`])
  if (visible.duration) arr.push(['TIME', run.duration])
  if (visible.heartRate) arr.push(['HR', `${run.heartRate} bpm`])
  if (visible.elevation) arr.push(['ELEV', `+${run.elevation} m`])
  if (visible.calories) arr.push(['KCAL', run.calories])
  return arr
}
```

Create `components/stickers/index.ts` (just re-exports for now — STICKER_DEFS added in Step 6):

```ts
export * from './types'
```

- [x] **Step 4: Create components/stickers/StickerBigNumber.tsx**

```tsx
'use client'
import type { StickerProps } from './types'
import { statList } from './types'

export function StickerBigNumber({ run, visible, accent }: StickerProps) {
  const stats = statList(run, visible).filter((s) => s[0] !== 'DIST')
  return (
    <div
      className="ovl ovl-bignum"
      style={{ ['--accent' as string]: accent, textAlign: 'center', width: 200 }}
    >
      <div className="ovl-bignum-lbl">DISTANCE</div>
      <div className="ovl-bignum-val">{run.distance}</div>
      <div className="ovl-bignum-unit">KILOMETERS</div>
      {stats.length > 0 && (
        <div className="ovl-bignum-foot">
          {stats.slice(0, 3).map((s, i) => (
            <span key={s[0]}>
              {i > 0 && <span className="ovl-bignum-sep">·</span>}
              <span className="ovl-bignum-foot-v">{s[1]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

Add the CSS classes for sticker overlay components to `app/globals.css` — copy the full `.ovl*` block from `styles.css` in the prototype root (lines starting with `/* STICKERS */`).

- [x] **Step 5: Create remaining sticker components**

Create `components/stickers/StickerBoldCaps.tsx`:

```tsx
'use client'
import type { StickerProps } from './types'

export function StickerBoldCaps({ run, visible, accent }: StickerProps) {
  const order: [string, string, string][] = []
  if (visible.duration) order.push(['TIME', run.duration.replace(':', '.'), 'MIN'])
  if (visible.distance) order.push(['KM', run.distance, 'KM'])
  if (visible.pace) order.push(['PACE', run.pace, '/KM'])
  if (order.length === 0) order.push(['KM', run.distance, 'KM'])

  return (
    <div className="ovl ovl-boldcaps" style={{ ['--accent' as string]: accent }}>
      {order.slice(0, 3).map((col, i) => (
        <div className="ovl-bc-col" key={col[0] + i}>
          <div className="ovl-bc-v">{col[1]}</div>
          <div className="ovl-bc-u">{col[2]}</div>
        </div>
      ))}
    </div>
  )
}
```

Create `components/stickers/StickerMonoBlock.tsx`:

```tsx
'use client'
import type { StickerProps } from './types'
import { statList } from './types'

export function StickerMonoBlock({ run, visible, accent }: StickerProps) {
  const stats = statList(run, visible)
  return (
    <div className="ovl ovl-mono" style={{ ['--accent' as string]: accent }}>
      <div className="ovl-mono-head">
        <span className="ovl-mono-dot" />
        <span>{run.date} · {visible.city ? run.city.toUpperCase() : 'RUN'}</span>
      </div>
      <div className="ovl-mono-rows">
        {stats.slice(0, 5).map(([k, v]) => (
          <div className="ovl-mono-row" key={k}>
            <span className="ovl-mono-k">{k}</span>
            <span className="ovl-mono-dots" />
            <span className="ovl-mono-v">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Create `components/stickers/StickerSerif.tsx`:

```tsx
'use client'
import type { StickerProps } from './types'

export function StickerSerif({ run, visible, accent }: StickerProps) {
  return (
    <div className="ovl ovl-serif" style={{ ['--accent' as string]: accent }}>
      <div className="ovl-serif-cap">a quiet<br />morning run.</div>
      <div className="ovl-serif-stats">
        {visible.distance && <span><b>{run.distance}</b> km</span>}
        {visible.pace && <span><b>{run.pace}</b>/km</span>}
        {visible.duration && <span><b>{run.duration}</b></span>}
      </div>
      <div className="ovl-serif-rule" />
      {visible.city && <div className="ovl-serif-foot">— {run.city}, ID</div>}
    </div>
  )
}
```

Create `components/stickers/StickerCapsule.tsx`:

```tsx
'use client'
import type { StickerProps } from './types'

export function StickerCapsule({ run, visible, accent }: StickerProps) {
  return (
    <div className="ovl ovl-capsule" style={{ ['--accent' as string]: accent }}>
      <div className="ovl-cap-pill">
        <span className="ovl-cap-pin" />
        <span className="ovl-cap-txt">{visible.city ? run.city.toUpperCase() : 'RUN'}</span>
        <span className="ovl-cap-div" />
        <span className="ovl-cap-num">{run.distance}<span>KM</span></span>
      </div>
      <div className="ovl-cap-sub">{run.date} · {run.title}</div>
    </div>
  )
}
```

Create `components/stickers/StickerChat.tsx`:

```tsx
'use client'
import type { StickerProps } from './types'

export function StickerChat({ run, visible, accent }: StickerProps) {
  const headline = visible.distance
    ? `just ran ${run.distance} km`
    : `ran a ${run.title.toLowerCase()}`
  const sub = [
    visible.duration && `${run.duration} total`,
    visible.pace && `${run.pace}/km`,
  ].filter(Boolean).join(' · ')

  return (
    <div className="ovl ovl-chat" style={{ ['--accent' as string]: accent }}>
      <div className="ovl-chat-bubble">
        <div className="ovl-chat-msg">{headline}</div>
        {sub && <div className="ovl-chat-sub">{sub}</div>}
        <div className="ovl-chat-tail" />
      </div>
      <div className="ovl-chat-meta">
        <span className="ovl-chat-avatar">PM</span>
        <span>pacemark · 2m</span>
      </div>
    </div>
  )
}
```

- [x] **Step 6: Replace components/stickers/index.ts with full content including STICKER_DEFS**

```ts
export * from './types'

import { StickerBigNumber } from './StickerBigNumber'
import { StickerBoldCaps } from './StickerBoldCaps'
import { StickerMonoBlock } from './StickerMonoBlock'
import { StickerSerif } from './StickerSerif'
import { StickerCapsule } from './StickerCapsule'
import { StickerChat } from './StickerChat'
import type { StickerDef } from './types'

export const STICKER_DEFS: StickerDef[] = [
  { id: 'bignumber', name: 'Big Number', desc: 'Hero', comp: StickerBigNumber },
  { id: 'boldcaps',  name: 'Bold Caps',  desc: 'Three stats', comp: StickerBoldCaps },
  { id: 'mono',      name: 'Mono Block', desc: 'Receipt', comp: StickerMonoBlock },
  { id: 'serif',     name: 'Serif Note', desc: 'Editorial', comp: StickerSerif },
  { id: 'capsule',   name: 'Capsule',    desc: 'Location pill', comp: StickerCapsule },
  { id: 'chat',      name: 'Chat',       desc: 'Bubble', comp: StickerChat },
]
```

- [x] **Step 7: Copy sticker CSS to globals.css**

Append the full `.ovl*` CSS block from the prototype's `styles.css` (the section marked `STICKERS — overlay style`) to `app/globals.css`.

- [x] **Step 8: Run tests — verify they pass**

```bash
npm test -- --testPathPattern=StickerBigNumber --verbose
```

Expected: both tests pass.

- [x] **Step 9: Commit**

```bash
git add components/stickers/ __tests__/components/StickerBigNumber.test.tsx
git commit -m "feat: add 6 sticker components"
```

---

## Task 10: Export lib + StickerTile

**Files:**
- Create: `lib/export.ts`
- Create: `components/ui/StickerTile.tsx`
- Create: `__tests__/lib/export.test.ts`
- Create: `__tests__/components/StickerTile.test.tsx`

- [x] **Step 1: Write failing export test**

Create `__tests__/lib/export.test.ts`:

```ts
import { downloadBlob } from '@/lib/export'

describe('downloadBlob', () => {
  it('creates an object URL and triggers anchor click', () => {
    const blob = new Blob(['fake-png'], { type: 'image/png' })
    const mockUrl = 'blob:mock-url'
    const mockClick = jest.fn()
    const mockRevoke = jest.fn()

    global.URL.createObjectURL = jest.fn(() => mockUrl)
    global.URL.revokeObjectURL = mockRevoke

    const mockAnchor = { href: '', download: '', click: mockClick }
    jest.spyOn(document, 'createElement').mockReturnValueOnce(mockAnchor as any)

    downloadBlob(blob, 'test.png')

    expect(mockAnchor.href).toBe(mockUrl)
    expect(mockAnchor.download).toBe('test.png')
    expect(mockClick).toHaveBeenCalled()
    expect(mockRevoke).toHaveBeenCalledWith(mockUrl)
  })
})
```

- [x] **Step 2: Run test — verify it fails**

```bash
npm test -- --testPathPattern=export --verbose
```

Expected: `Cannot find module '@/lib/export'`

- [x] **Step 3: Create lib/export.ts**

```ts
import html2canvas from 'html2canvas'

export async function stickerToBlob(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: null,
    useCORS: true,
    logging: false,
  })
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('canvas_to_blob_failed'))
    }, 'image/png')
  })
}

export function downloadBlob(blob: Blob, filename = 'pacemark-sticker.png'): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function copyBlobToClipboard(blob: Blob): Promise<void> {
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}
```

- [x] **Step 4: Run export test — verify it passes**

```bash
npm test -- --testPathPattern=lib/export --verbose
```

Expected: 1 test passes.

- [x] **Step 5: Write failing StickerTile test**

Create `__tests__/components/StickerTile.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StickerTile } from '@/components/ui/StickerTile'
import { STICKER_DEFS } from '@/components/stickers'
import type { DisplayActivity } from '@/lib/strava'

jest.mock('@/lib/export', () => ({
  stickerToBlob: jest.fn().mockResolvedValue(new Blob([''], { type: 'image/png' })),
  downloadBlob: jest.fn(),
  copyBlobToClipboard: jest.fn().mockResolvedValue(undefined),
}))

const run: DisplayActivity = {
  id: 1, title: 'Morning Run', date: 'May 17',
  distance: '10.2', pace: '5:32', duration: '54:12',
  heartRate: '142', elevation: '88', calories: '612',
  city: 'Jakarta', routeSeed: 3.1, fresh: true,
}

const visible = {
  distance: true, pace: true, duration: true,
  heartRate: false, elevation: true, calories: false, city: true,
}

describe('StickerTile', () => {
  const def = STICKER_DEFS[0]

  it('renders tile name', () => {
    render(<StickerTile def={def} run={run} visible={visible} accent="#FF5A1F" bg="dark" />)
    expect(screen.getByText('Big Number')).toBeInTheDocument()
  })

  it('shows Copied after copy button click', async () => {
    render(<StickerTile def={def} run={run} visible={visible} accent="#FF5A1F" bg="dark" />)
    fireEvent.click(screen.getByText('Copy'))
    await waitFor(() => expect(screen.getByText('Copied')).toBeInTheDocument())
  })
})
```

- [x] **Step 6: Run StickerTile test — verify it fails**

```bash
npm test -- --testPathPattern=StickerTile --verbose
```

Expected: `Cannot find module '@/components/ui/StickerTile'`

- [x] **Step 7: Create components/ui/StickerTile.tsx**

```tsx
'use client'
import { useRef, useState } from 'react'
import { stickerToBlob, downloadBlob, copyBlobToClipboard } from '@/lib/export'
import type { DisplayActivity } from '@/lib/strava'
import type { StickerDef, VisibleMetrics } from '@/components/stickers'

interface StickerTileProps {
  def: StickerDef
  run: DisplayActivity
  visible: VisibleMetrics
  accent: string
  bg: 'dark' | 'light' | 'checker'
}

export function StickerTile({ def, run, visible, accent, bg }: StickerTileProps) {
  const captureRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'working' | 'done'>('idle')

  const Comp = def.comp

  async function handleCopy() {
    if (!captureRef.current) return
    try {
      const blob = await stickerToBlob(captureRef.current)
      await copyBlobToClipboard(blob)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      if (captureRef.current) {
        const blob = await stickerToBlob(captureRef.current)
        downloadBlob(blob)
      }
    }
  }

  async function handleSave() {
    if (!captureRef.current) return
    setSaveState('working')
    try {
      const blob = await stickerToBlob(captureRef.current)
      downloadBlob(blob)
      setSaveState('done')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('idle')
    }
  }

  return (
    <div className="tile">
      <div className="tile-head">
        <div className="tile-name">{def.name}</div>
        <div className="tile-desc">{def.desc}</div>
      </div>
      <div className={`tile-stage tile-stage-${bg}`}>
        <div className="tile-stage-inner">
          <Comp run={run} visible={visible} accent={accent} />
        </div>
      </div>
      {/* Hidden capture target — transparent bg, no drop-shadow wrapper */}
      <div
        ref={captureRef}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', top: 0, left: 0 }}
        aria-hidden="true"
      >
        <Comp run={run} visible={visible} accent={accent} />
      </div>
      <div className="tile-actions">
        <button
          className={`tile-btn tile-btn-copy ${copied ? 'is-done' : ''}`}
          onClick={handleCopy}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <button
          className={`tile-btn tile-btn-save ${saveState !== 'idle' ? 'is-active' : ''}`}
          onClick={handleSave}
        >
          {saveState === 'working'
            ? 'Saving…'
            : saveState === 'done'
            ? '✓ Saved'
            : 'PNG'}
        </button>
      </div>
    </div>
  )
}
```

- [x] **Step 8: Run all tests — verify they pass**

```bash
npm test -- --verbose
```

Expected: all tests pass.

- [x] **Step 9: Commit**

```bash
git add lib/export.ts components/ui/StickerTile.tsx __tests__/lib/export.test.ts __tests__/components/StickerTile.test.tsx
git commit -m "feat: add export lib and StickerTile with copy/PNG"
```

---

## Task 11: Landing page

**Files:**
- Modify: `app/page.tsx`

- [x] **Step 1: Replace app/page.tsx**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleConnect() {
    setConnecting(true)
    router.push('/api/auth/strava')
  }

  return (
    <div className="screen screen-landing">
      <div className="landing-bg">
        <div className="landing-bg-grain" />
      </div>
      <div className="landing-content">
        <div className="landing-logo">
          <div className="landing-mark">
            <svg viewBox="0 0 32 32" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22c4-2 6-10 10-10s4 8 8 8 6-2 6-2" />
              <circle cx="4" cy="22" r="1.4" fill="currentColor" />
              <circle cx="28" cy="18" r="1.4" fill="currentColor" />
            </svg>
          </div>
          <div className="landing-wordmark">pacemark</div>
        </div>

        <div className="landing-hero">
          <h1 className="landing-title">Turn your runs into stories.</h1>
          <p className="landing-sub">
            Pull your activities, pick a template, post a sticker that actually looks like you ran on purpose.
          </p>
        </div>

        {error && (
          <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 12 }}>
            {error === 'access_denied' ? 'Access denied — try again.' : 'Something went wrong. Please try again.'}
          </p>
        )}

        <div className="landing-cta-wrap">
          <button
            className={`landing-cta ${connecting ? 'is-connecting' : ''}`}
            onClick={handleConnect}
            disabled={connecting}
          >
            <span className="landing-cta-icon"><BoltIcon /></span>
            <span className="landing-cta-label">
              {connecting ? 'Connecting…' : 'Connect with Strava'}
            </span>
            <span className="landing-cta-spinner" />
          </button>
          <div className="landing-disclaimer">
            We only read your activity data.<br />
            We never post on your behalf.
          </div>
        </div>

        <div className="landing-foot">
          <span>v1.0 · </span>
          <span className="landing-foot-dot">●</span>
          <span>privacy</span>
          <span className="landing-foot-dot">●</span>
          <span>terms</span>
        </div>
      </div>
    </div>
  )
}
```

Add to `app/globals.css` — copy the full `SCREEN 1 — LANDING` CSS block from the prototype's `styles.css`.

- [x] **Step 2: Handle error query param**

Update `LandingPage` to read the `error` search param on mount:

```tsx
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LandingContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  // ... rest of component using error
}

export default function LandingPage() {
  return (
    <Suspense>
      <LandingContent />
    </Suspense>
  )
}
```

Refactor the full component to use `LandingContent` as the inner component and `LandingPage` as the `Suspense` wrapper.

- [x] **Step 3: Verify landing renders**

```bash
npm run dev
```

Open http://localhost:3000. Expected: dark landing screen with "pacemark" logo and orange "Connect with Strava" button.

- [x] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add landing page with Strava connect"
```

---

## Task 12: Picker page

**Files:**
- Create: `app/picker/page.tsx`
- Create: `components/ui/RunCard.tsx`

- [x] **Step 1: Create components/ui/RunCard.tsx**

```tsx
'use client'
import { MiniMap } from './MiniMap'
import type { DisplayActivity } from '@/lib/strava'

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  )
}

function PinIcon({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

interface RunCardProps {
  run: DisplayActivity
  active: boolean
  onClick: () => void
  accent: string
}

export function RunCard({ run, active, onClick, accent }: RunCardProps) {
  return (
    <button
      className={`runcard ${active ? 'is-active' : ''}`}
      onClick={onClick}
    >
      <MiniMap seed={run.routeSeed} accent={active ? accent : '#71717a'} />
      <div className="runcard-body">
        <div className="runcard-top">
          <div className="runcard-title">
            {run.title}
            {run.fresh && <span className="runcard-fresh">NEW</span>}
          </div>
          <div className="runcard-date">{run.date}</div>
        </div>
        <div className="runcard-stats">
          <div className="runcard-stat">
            <div className="runcard-stat-v">{run.distance}<span>km</span></div>
            <div className="runcard-stat-k">distance</div>
          </div>
          <div className="runcard-stat">
            <div className="runcard-stat-v">{run.pace}<span>/km</span></div>
            <div className="runcard-stat-k">pace</div>
          </div>
          <div className="runcard-stat">
            <div className="runcard-stat-v">{run.duration}</div>
            <div className="runcard-stat-k">duration</div>
          </div>
        </div>
        <div className="runcard-foot">
          <span className="runcard-pin"><PinIcon /> {run.city}</span>
          <span>♥ {run.heartRate} bpm</span>
          <span>↑ {run.elevation} m</span>
        </div>
      </div>
      <div className={`runcard-check ${active ? 'is-active' : ''}`}>
        {active && <CheckIcon />}
      </div>
    </button>
  )
}
```

Add to `app/globals.css` — copy the full `SCREEN 2 — PICKER` CSS block from the prototype's `styles.css`.

- [x] **Step 2: Create app/picker/page.tsx**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RunCard } from '@/components/ui/RunCard'
import type { DisplayActivity } from '@/lib/strava'

const ACCENT = '#FF5A1F'

export default function PickerPage() {
  const router = useRouter()
  const [runs, setRuns] = useState<DisplayActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/activities')
      .then((res) => {
        if (res.status === 401) {
          router.push('/')
          return null
        }
        if (!res.ok) throw new Error('fetch_failed')
        return res.json()
      })
      .then((data: DisplayActivity[] | null) => {
        if (data) {
          setRuns(data)
          if (data.length > 0) setSelectedId(data[0].id)
        }
      })
      .catch(() => setError('Could not load activities. Strava may be down.'))
      .finally(() => setLoading(false))
  }, [router])

  const selected = runs.find((r) => r.id === selectedId)

  function handleMakeStickers() {
    if (!selectedId) return
    router.push(`/studio/${selectedId}`)
  }

  return (
    <div className="screen screen-picker">
      <header className="picker-header">
        <div className="picker-user">
          <div className="picker-avatar">PM</div>
          <div className="picker-user-meta">
            <div className="picker-user-name">Pacemark Runner</div>
            <div className="picker-user-sub">Connected</div>
          </div>
        </div>
        <button
          className="picker-disconnect"
          onClick={async () => {
            await fetch('/api/auth/strava', { method: 'DELETE' }).catch(() => {})
            router.push('/')
          }}
        >
          Disconnect
        </button>
      </header>

      <div className="picker-title-row">
        <div className="picker-title-wrap">
          <div className="picker-eyebrow">RECENT ACTIVITIES</div>
          <h2 className="picker-title">Pick a run</h2>
        </div>
        <div className="picker-count">{runs.length} runs · last 30 days</div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
          Loading activities…
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--accent)' }}>
          {error}
        </div>
      )}

      <div className="picker-list">
        {runs.map((run) => (
          <RunCard
            key={run.id}
            run={run}
            active={selectedId === run.id}
            onClick={() => setSelectedId(run.id)}
            accent={ACCENT}
          />
        ))}
      </div>

      <div className="picker-cta-bar">
        <div className="picker-cta-meta">
          {selected
            ? <><b>{selected.title}</b> · {selected.distance} km</>
            : <>Tap a run above to continue</>}
        </div>
        <button
          className="picker-cta"
          disabled={!selectedId}
          onClick={handleMakeStickers}
        >
          Make Stickers →
        </button>
      </div>
    </div>
  )
}
```

- [x] **Step 3: Add disconnect route**

Create `app/api/auth/strava/route.ts` — update to export both `GET` and `DELETE`:

```ts
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'activity:read_all',
  })
  return NextResponse.redirect(
    `https://www.strava.com/oauth/authorize?${params.toString()}`
  )
}

export async function DELETE() {
  const session = await getSession()
  session.destroy()
  return NextResponse.json({ ok: true })
}
```

- [x] **Step 4: Verify picker renders**

With dev server running, after OAuth callback, navigate to http://localhost:3000/picker. Expected: list of activities from Strava with MiniMap route lines. Without a real Strava account, verify the page redirects to `/` on 401.

- [x] **Step 5: Commit**

```bash
git add app/picker/ components/ui/RunCard.tsx app/api/auth/strava/route.ts
git commit -m "feat: add activity picker page"
```

---

## Task 13: Studio page

**Files:**
- Create: `app/studio/[runId]/page.tsx`

- [x] **Step 1: Create app/studio/[runId]/page.tsx**

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { StickerTile } from '@/components/ui/StickerTile'
import { STICKER_DEFS, VISIBLE_LABELS, type VisibleMetrics } from '@/components/stickers'
import type { DisplayActivity } from '@/lib/strava'

const ACCENT_SWATCHES = ['#FF5A1F', '#22D3A0', '#9B5CFF', '#FFC83D', '#3B82F6', '#F472B6']

function CheckIcon({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4 7 12l8 8" />
    </svg>
  )
}

const DEFAULT_VISIBLE: VisibleMetrics = {
  distance: true, pace: true, duration: true,
  heartRate: false, elevation: true, calories: false, city: true,
}

export default function StudioPage() {
  const router = useRouter()
  const { runId } = useParams<{ runId: string }>()

  const [run, setRun] = useState<DisplayActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState<VisibleMetrics>(DEFAULT_VISIBLE)
  const [accent, setAccent] = useState(ACCENT_SWATCHES[0])
  const [bg, setBg] = useState<'dark' | 'light' | 'checker'>('dark')

  useEffect(() => {
    fetch(`/api/activities/${runId}`)
      .then((res) => {
        if (res.status === 401) { router.push('/'); return null }
        if (!res.ok) throw new Error('fetch_failed')
        return res.json()
      })
      .then((data: DisplayActivity | null) => { if (data) setRun(data) })
      .catch(() => router.push('/picker'))
      .finally(() => setLoading(false))
  }, [runId, router])

  function toggleMetric(k: keyof VisibleMetrics) {
    setVisible((v) => ({ ...v, [k]: !v[k] }))
  }

  if (loading || !run) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
        Loading…
      </div>
    )
  }

  return (
    <div className="screen screen-studio">
      <header className="studio-head">
        <button className="studio-back" onClick={() => router.push('/picker')}>
          <ArrowLeftIcon /> Activities
        </button>
        <div className="studio-runref">
          <div className="studio-runref-date">{run.date.toUpperCase()}</div>
          <div className="studio-runref-title">{run.title}</div>
          <div className="studio-runref-stats">
            <span><b>{run.distance}</b> km</span>
            <span className="studio-runref-dot">·</span>
            <span><b>{run.pace}</b>/km</span>
            <span className="studio-runref-dot">·</span>
            <span><b>{run.duration}</b></span>
          </div>
        </div>
      </header>

      <div className="studio-toolbar">
        <div className="toolbar-sec">
          <div className="toolbar-eyebrow">METRICS TO SHOW</div>
          <div className="chip-row">
            {(Object.keys(VISIBLE_LABELS) as (keyof VisibleMetrics)[]).map((k) => (
              <button
                key={k}
                className={`chip ${visible[k] ? 'is-on' : ''}`}
                onClick={() => toggleMetric(k)}
              >
                <span className="chip-dot" />
                {VISIBLE_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-sec toolbar-sec-row">
          <div className="toolbar-sub">
            <div className="toolbar-eyebrow">ACCENT</div>
            <div className="swatch-row">
              {ACCENT_SWATCHES.map((c) => (
                <button
                  key={c}
                  className={`swatch ${accent === c ? 'is-active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setAccent(c)}
                  aria-label={c}
                >
                  {accent === c && <CheckIcon />}
                </button>
              ))}
            </div>
          </div>
          <div className="toolbar-sub">
            <div className="toolbar-eyebrow">PREVIEW ON</div>
            <div className="bg-row">
              {(['dark', 'light', 'checker'] as const).map((id) => (
                <button
                  key={id}
                  className={`bg-btn ${bg === id ? 'is-active' : ''}`}
                  onClick={() => setBg(id)}
                >
                  <span className={`bg-swatch bg-swatch-${id}`} />
                  {id === 'dark' ? 'Dark photo' : id === 'light' ? 'Light photo' : 'Transparent'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="studio-grid">
        {STICKER_DEFS.map((def) => (
          <StickerTile
            key={def.id}
            def={def}
            run={run}
            visible={visible}
            accent={accent}
            bg={bg}
          />
        ))}
      </div>

      <footer className="studio-foot">
        Drop the PNG into Instagram Story · or long-press to paste from clipboard
      </footer>
    </div>
  )
}
```

Add to `app/globals.css` — copy the full `SCREEN 3 — STUDIO` CSS block from the prototype's `styles.css`.

- [x] **Step 2: Verify full flow in browser**

```bash
npm run dev
```

1. Open http://localhost:3000 — landing renders.
2. Click "Connect with Strava" — redirects to Strava OAuth.
3. Authorize — redirects to `/picker` with real activities.
4. Select a run → click "Make Stickers →" — opens `/studio/[runId]`.
5. Studio shows 6 sticker tiles. Toggle metrics, switch accents, switch bg.
6. Click "Copy" on Big Number tile — browser requests clipboard permission, tile shows "✓ Copied".
7. Click "PNG" on any tile — PNG file downloads.

- [x] **Step 3: Run all tests**

```bash
npm test
```

Expected: all tests pass with no failures.

- [x] **Step 4: Commit**

```bash
git add app/studio/
git commit -m "feat: add sticker studio page"
```

---

## Task 14: Vercel deployment

**Files:**
- Create: `vercel.json` (optional — only if custom rewrites needed)

- [x] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/<your-username>/pacemark.git
git push -u origin master
```

- [x] **Step 2: Create Vercel project**

Go to https://vercel.com/new → import the GitHub repo → accept default Next.js settings.

- [x] **Step 3: Add environment variables in Vercel dashboard**

Under Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `STRAVA_CLIENT_ID` | from https://www.strava.com/settings/api |
| `STRAVA_CLIENT_SECRET` | from Strava API settings |
| `SESSION_PASSWORD` | 32+ random chars (generate: `openssl rand -base64 32`) |
| `NEXT_PUBLIC_BASE_URL` | your Vercel deployment URL e.g. `https://pacemark.vercel.app` |

- [x] **Step 4: Add Vercel callback URL to Strava app**

In Strava API settings → Authorization Callback Domain: add your Vercel domain (e.g. `pacemark.vercel.app`).

- [x] **Step 5: Trigger deploy and verify**

Push any commit to `master`. Vercel auto-deploys. Visit the deployed URL and run through the full OAuth flow.

- [x] **Step 6: Final commit**

```bash
git add .
git commit -m "chore: finalize deployment config"
git push
```
