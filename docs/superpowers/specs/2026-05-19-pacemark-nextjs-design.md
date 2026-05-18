# Pacemark — Next.js Migration Design

_Date: 2026-05-19_

## Overview

Migrate Pacemark (running sticker generator) from a vanilla HTML/CDN-React prototype to a production Next.js 15 app with real Strava OAuth, live activity data, and functional PNG/clipboard sticker export. Deploy on Vercel.

## Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 (App Router) | API routes handle OAuth server-side; zero-config Vercel deploy |
| Language | TypeScript | Type-safe Strava API responses |
| Styling | Tailwind CSS + custom tokens | Replace hand-written `styles.css`; existing design tokens map to Tailwind config |
| Auth/session | `iron-session` | Encrypted HTTP-only cookie, no DB required |
| PNG export | `html2canvas` | Client-side canvas capture → blob → download/clipboard |
| Deployment | Vercel | Native Next.js support |

## File Structure

```
app/
  page.tsx                        Landing screen
  picker/
    page.tsx                      Activity picker (auth-protected)
  studio/
    [runId]/
      page.tsx                    Sticker studio (auth-protected)
  api/
    auth/
      strava/route.ts             Redirects browser to Strava OAuth
      callback/route.ts           Exchanges code → tokens, sets cookie, redirects to /picker
    activities/
      route.ts                    GET /api/activities — proxies Strava list endpoint
      [runId]/route.ts            GET /api/activities/[runId] — proxies single activity

components/
  stickers/
    StickerBigNumber.tsx
    StickerBoldCaps.tsx
    StickerMonoBlock.tsx
    StickerSerif.tsx
    StickerCapsule.tsx
    StickerChat.tsx
    index.ts                      Re-exports STICKER_DEFS array
  ui/
    MiniMap.tsx
    RunCard.tsx
    StickerTile.tsx               Wraps sticker + Copy/PNG buttons + hidden capture target
    Chip.tsx
    Swatch.tsx

lib/
  strava.ts                       Typed Strava API client (getActivities, getActivity, refreshToken)
  session.ts                      iron-session config + getSession() helper
  export.ts                       html2canvas → blob → download / clipboard.write()
```

## Authentication Flow

1. User clicks "Connect with Strava" on landing page.
2. `/api/auth/strava` builds Strava OAuth URL (scope: `activity:read`) and redirects.
3. Strava redirects to `/api/auth/callback?code=...`.
4. Server POSTs to `https://www.strava.com/oauth/token` with `client_id`, `client_secret`, `code`.
5. Server stores `{ access_token, refresh_token, expires_at, athlete_id }` in encrypted HTTP-only cookie via `iron-session`.
6. Server redirects to `/picker`.

**Secrets stored in Vercel env vars only:** `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `SESSION_SECRET`.

## Token Refresh

Every API route call checks `expires_at` before using `access_token`. If expired:
1. POST to Strava token refresh endpoint with `refresh_token`.
2. Overwrite cookie with new `access_token` + `expires_at`.
3. Continue with original request.

Strava refresh tokens rotate every 6 hours of use; they expire after 90 days of inactivity. On expiry, clear cookie and return `401` — client redirects to `/`.

## Data Flow

```
Client (/picker)
  → fetch('/api/activities')
  → API route reads token from cookie
  → GET strava.com/api/v3/athlete/activities?per_page=30
  → returns ActivitySummary[]
  → RunCard list renders

Client (/studio/[runId])
  → fetch('/api/activities/[runId]')
  → API route reads token, fetches detailed activity
  → StickerGrid renders with real stats
```

Token never reaches the client. All Strava API calls go through `/api/*` routes.

## PNG Export

Each `StickerTile` renders two copies of its sticker:
- **Visible copy** — styled normally with `drop-shadow` for the preview grid.
- **Hidden capture target** — same sticker, fixed dimensions, `position: absolute; opacity: 0; pointer-events: none`, no shadow wrapper. `backgroundColor: null` preserves transparency.

Export function in `lib/export.ts`:

```ts
async function exportSticker(el: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: null, useCORS: true });
  return new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
}
```

**Download:** `URL.createObjectURL(blob)` → programmatic `<a download="pacemark-sticker.png">` click → `revokeObjectURL`.

**Clipboard:** `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])`. Requires HTTPS + user gesture (both guaranteed). On `NotAllowedError`, falls back to auto-download.

## Protected Routes

Middleware (`middleware.ts`) checks for valid session cookie on `/picker` and `/studio/**`. No valid session → redirect to `/`. Runs at the edge, no DB round-trip.

## Error States

| Condition | Behaviour |
|-----------|-----------|
| No session | Redirect to `/` |
| Strava API error (5xx) | Toast: "Strava is down, try again" — keep last fetched data |
| Token refresh fails | Clear cookie, redirect to `/` |
| ClipboardItem not allowed | Auto-trigger PNG download instead |
| `html2canvas` render error | Toast: "Export failed", log to console |

## Component Migration Notes

- All 6 sticker components: direct JSX → TSX conversion, add `"use client"`.
- `styles.css` custom properties map to Tailwind config `extend.colors` / `extend.fontFamily`.
- `tweaks-panel.jsx` dropped — dev tooling not needed in production build.
- `MiniMap` SVG route line generation: extract `RouteLine` into `components/ui/RouteLine.tsx`.

## Out of Scope

- User accounts / database storage of activities
- Social sharing (direct post to Instagram)
- Multiple athlete support
- Activity search / filtering beyond last 30
