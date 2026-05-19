# Pacemark Fixes & New Stickers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix mobile clipboard (Web Share API cascade), fix canvas export transparent padding, add per-km splits to the data model, and add two new stickers: Pace Splits Bar and Thermal Receipt.

**Architecture:** Each fix is isolated to 1-2 files. The data model change (`lib/strava.ts`) must land before the new sticker components use it. CSS for new stickers goes into `app/globals.css` alongside existing sticker styles.

**Tech Stack:** Next.js 15 App Router, TypeScript, React 18, Jest + Testing Library, html2canvas, Strava API

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/export.ts` | Modify | Add `shareBlobFile()` |
| `lib/strava.ts` | Modify | Add `splits_metric` to `ActivitySummary`, `splits` to `DisplayActivity`, map in `toDisplayActivity` |
| `components/ui/StickerTile.tsx` | Modify | Copy→Share→Download cascade, adaptive toast, capture padding |
| `components/stickers/StickerPaceSplits.tsx` | Create | Pace splits bar chart sticker |
| `components/stickers/StickerThermalReceipt.tsx` | Create | Thermal receipt sticker |
| `components/stickers/index.ts` | Modify | Register both new stickers |
| `app/globals.css` | Modify | CSS for both new stickers |
| `__tests__/lib/export.test.ts` | Modify | Test `shareBlobFile` |
| `__tests__/lib/strava.test.ts` | Modify | Test splits mapping |
| `__tests__/components/StickerTile.test.tsx` | Modify | Test share/download fallback paths, add `splits` to fixture |
| `__tests__/components/StickerBigNumber.test.tsx` | Modify | Add `splits` to fixture (required by updated type) |
| `__tests__/components/StickerPaceSplits.test.tsx` | Create | Test pace splits sticker |
| `__tests__/components/StickerThermalReceipt.test.tsx` | Create | Test thermal receipt sticker |

---

## Task 1: Add `shareBlobFile` to export lib

**Files:**
- Modify: `lib/export.ts`
- Modify: `__tests__/lib/export.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `__tests__/lib/export.test.ts`:

```ts
import { downloadBlob, shareBlobFile } from '@/lib/export'

// ... existing downloadBlob tests stay unchanged ...

describe('shareBlobFile', () => {
  it('calls navigator.share with a File containing the blob', async () => {
    const blob = new Blob(['fake-png'], { type: 'image/png' })
    const mockShare = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(global.navigator, 'share', {
      value: mockShare,
      writable: true,
      configurable: true,
    })

    await shareBlobFile(blob)

    expect(mockShare).toHaveBeenCalledWith({
      files: [expect.any(File)],
    })
    const file: File = mockShare.mock.calls[0][0].files[0]
    expect(file.name).toBe('pacemark-sticker.png')
    expect(file.type).toBe('image/png')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- --testPathPattern="export" --no-coverage
```

Expected: FAIL — `shareBlobFile` is not exported from `@/lib/export`

- [ ] **Step 3: Implement `shareBlobFile` in `lib/export.ts`**

Add this function to the end of `lib/export.ts`:

```ts
export async function shareBlobFile(blob: Blob): Promise<void> {
  const file = new File([blob], 'pacemark-sticker.png', { type: 'image/png' })
  await navigator.share({ files: [file] })
}
```

- [ ] **Step 4: Run test to confirm it passes**

```bash
npm test -- --testPathPattern="export" --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/export.ts __tests__/lib/export.test.ts
git commit -m "feat: add shareBlobFile for Web Share API support"
```

---

## Task 2: Extend Strava data model with splits

**Files:**
- Modify: `lib/strava.ts`
- Modify: `__tests__/lib/strava.test.ts`
- Modify: `__tests__/components/StickerBigNumber.test.tsx` (fixture update)

> Note: Adding `splits` as a required field to `DisplayActivity` will break any test that constructs a `DisplayActivity` object. Update ALL fixtures in this task before running tests.

- [ ] **Step 1: Write the failing test**

Add to `__tests__/lib/strava.test.ts`, inside the existing `describe('toDisplayActivity', ...)` block:

```ts
it('maps splits_metric to splits array', async () => {
  const withSplits: ActivitySummary = {
    ...base,
    splits_metric: [
      { distance: 1000, moving_time: 342, average_speed: 2.92, pace_zone: 2 },
      { distance: 1000, moving_time: 335, average_speed: 2.99, pace_zone: 2 },
    ],
  }
  const display = await toDisplayActivity(withSplits)
  expect(display.splits).toHaveLength(2)
  expect(display.splits[0].km).toBe(1)
  expect(display.splits[1].km).toBe(2)
  expect(display.splits[0].pace).toBe(formatPace(2.92))
  expect(display.splits[0].speed).toBe(2.92)
})

it('sets splits to [] when splits_metric is absent', async () => {
  const display = await toDisplayActivity(base)
  expect(display.splits).toEqual([])
})
```

Also update `__tests__/lib/strava.test.ts` import to include `formatPace`:

```ts
import {
  formatDuration,
  formatPace,
  formatDistance,
  toDisplayActivity,
  type ActivitySummary,
} from '@/lib/strava'
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test -- --testPathPattern="strava" --no-coverage
```

Expected: FAIL — `display.splits` is undefined

- [ ] **Step 3: Update `lib/strava.ts`**

Add `splits_metric` field to `ActivitySummary` interface (after `start_latlng`):

```ts
splits_metric?: {
  distance: number
  moving_time: number
  average_speed: number
  pace_zone: number
}[]
```

Add `splits` field to `DisplayActivity` interface (after `fresh`):

```ts
splits: { km: number; pace: string; speed: number }[]
```

In `toDisplayActivity`, add `splits` to the returned object (after `fresh`):

```ts
splits: (a.splits_metric ?? []).map((s, i) => ({
  km: i + 1,
  pace: formatPace(s.average_speed),
  speed: s.average_speed,
})),
```

- [ ] **Step 4: Fix fixtures in `__tests__/components/StickerBigNumber.test.tsx`**

The `run` object there will now fail TypeScript since `splits` is required. Add `splits: []` to the fixture:

```ts
const run: DisplayActivity = {
  id: 1, title: 'Morning Run', date: 'May 17',
  distance: '10.2', pace: '5:32', duration: '54:12',
  heartRate: '142', elevation: '88', calories: '612',
  city: 'Jakarta', routeSeed: 3.1, fresh: true,
  splits: [],
}
```

- [ ] **Step 5: Run all tests**

```bash
npm test --no-coverage
```

Expected: All tests pass (23 existing + 2 new splits tests = 25 total)

- [ ] **Step 6: Commit**

```bash
git add lib/strava.ts __tests__/lib/strava.test.ts __tests__/components/StickerBigNumber.test.tsx
git commit -m "feat: add splits_metric mapping to DisplayActivity"
```

---

## Task 3: StickerTile — Web Share cascade + capture padding

**Files:**
- Modify: `components/ui/StickerTile.tsx`
- Modify: `__tests__/components/StickerTile.test.tsx`

- [ ] **Step 1: Write failing tests**

Replace the contents of `__tests__/components/StickerTile.test.tsx` with:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StickerTile } from '@/components/ui/StickerTile'
import { STICKER_DEFS } from '@/components/stickers'
import * as exportLib from '@/lib/export'
import type { DisplayActivity } from '@/lib/strava'

jest.mock('@/lib/export', () => ({
  stickerToBlob: jest.fn().mockResolvedValue(new Blob([''], { type: 'image/png' })),
  downloadBlob: jest.fn(),
  copyBlobToClipboard: jest.fn(),
  shareBlobFile: jest.fn(),
}))

const run: DisplayActivity = {
  id: 1, title: 'Morning Run', date: 'May 17',
  distance: '10.2', pace: '5:32', duration: '54:12',
  heartRate: '142', elevation: '88', calories: '612',
  city: 'Jakarta', routeSeed: 3.1, fresh: true,
  splits: [],
}

const visible = {
  distance: true, pace: true, duration: true,
  heartRate: false, elevation: true, calories: false, city: true,
}

describe('StickerTile', () => {
  const def = STICKER_DEFS[0]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(exportLib.copyBlobToClipboard as jest.Mock).mockResolvedValue(undefined)
    ;(exportLib.shareBlobFile as jest.Mock).mockResolvedValue(undefined)
  })

  it('renders tile name', () => {
    render(<StickerTile def={def} run={run} visible={visible} accent="#FF5A1F" bg="dark" />)
    expect(screen.getByText('Big Number')).toBeInTheDocument()
  })

  it('shows Copied when clipboard write succeeds', async () => {
    render(<StickerTile def={def} run={run} visible={visible} accent="#FF5A1F" bg="dark" />)
    fireEvent.click(screen.getByText('Copy'))
    await waitFor(() => expect(screen.getByText('Copied')).toBeInTheDocument())
  })

  it('shows Shared when clipboard fails but navigator.share succeeds', async () => {
    ;(exportLib.copyBlobToClipboard as jest.Mock).mockRejectedValue(new Error('not supported'))
    render(<StickerTile def={def} run={run} visible={visible} accent="#FF5A1F" bg="dark" />)
    fireEvent.click(screen.getByText('Copy'))
    await waitFor(() => expect(screen.getByText('Shared')).toBeInTheDocument())
  })

  it('calls downloadBlob when both clipboard and share fail', async () => {
    ;(exportLib.copyBlobToClipboard as jest.Mock).mockRejectedValue(new Error('not supported'))
    ;(exportLib.shareBlobFile as jest.Mock).mockRejectedValue(new Error('not supported'))
    render(<StickerTile def={def} run={run} visible={visible} accent="#FF5A1F" bg="dark" />)
    fireEvent.click(screen.getByText('Copy'))
    await waitFor(() => expect(exportLib.downloadBlob).toHaveBeenCalled())
  })
})
```

- [ ] **Step 2: Run tests to confirm new tests fail**

```bash
npm test -- --testPathPattern="StickerTile" --no-coverage
```

Expected: FAIL — `Shared` and `Saved` states do not exist yet; `shareBlobFile` not imported

- [ ] **Step 3: Update `components/ui/StickerTile.tsx`**

Replace the full file with:

```tsx
'use client'
import { useRef, useState } from 'react'
import { stickerToBlob, downloadBlob, copyBlobToClipboard, shareBlobFile } from '@/lib/export'
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
  const [copyLabel, setCopyLabel] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'working' | 'done'>('idle')

  const Comp = def.comp

  async function handleCopy() {
    if (!captureRef.current) return
    const blob = await stickerToBlob(captureRef.current)
    try {
      await copyBlobToClipboard(blob)
      setCopyLabel('Copied')
    } catch {
      try {
        await shareBlobFile(blob)
        setCopyLabel('Shared')
      } catch {
        downloadBlob(blob)
        setCopyLabel('Saved')
      }
    }
    setTimeout(() => setCopyLabel(''), 1800)
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
      {/* Off-screen capture target: padding adds transparent border to exported PNG */}
      <div
        style={{
          position: 'fixed',
          left: -9999,
          top: -9999,
          pointerEvents: 'none',
          display: 'block',
        }}
        aria-hidden="true"
      >
        <div ref={captureRef} style={{ width: 'fit-content', padding: 24 }}>
          <Comp run={run} visible={visible} accent={accent} />
        </div>
      </div>
      <div className="tile-actions">
        <button
          className={`tile-btn tile-btn-copy ${copyLabel ? 'is-done' : ''}`}
          onClick={handleCopy}
        >
          {copyLabel || 'Copy'}
        </button>
        <button
          className={`tile-btn tile-btn-save ${saveState !== 'idle' ? 'is-active' : ''}`}
          onClick={handleSave}
        >
          {saveState === 'working'
            ? 'Saving…'
            : saveState === 'done'
            ? 'Saved'
            : 'PNG'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="StickerTile" --no-coverage
```

Expected: PASS (4 tests)

- [ ] **Step 5: Run full suite**

```bash
npm test --no-coverage
```

Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add components/ui/StickerTile.tsx __tests__/components/StickerTile.test.tsx
git commit -m "fix: web share cascade for mobile copy, transparent padding on canvas export"
```

---

## Task 4: StickerPaceSplits component + CSS

**Files:**
- Create: `components/stickers/StickerPaceSplits.tsx`
- Modify: `app/globals.css`
- Create: `__tests__/components/StickerPaceSplits.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/components/StickerPaceSplits.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { StickerPaceSplits } from '@/components/stickers/StickerPaceSplits'
import type { DisplayActivity } from '@/lib/strava'

const run: DisplayActivity = {
  id: 1, title: 'Morning Run', date: 'May 17',
  distance: '10.2', pace: '5:32', duration: '54:12',
  heartRate: '142', elevation: '88', calories: '612',
  city: 'Jakarta', routeSeed: 3.1, fresh: true,
  splits: [
    { km: 1, pace: '5:42', speed: 2.92 },
    { km: 2, pace: '5:35', speed: 2.99 },
    { km: 3, pace: '5:28', speed: 3.05 },
  ],
}

const visible = {
  distance: true, pace: true, duration: true,
  heartRate: false, elevation: true, calories: false, city: true,
}

describe('StickerPaceSplits', () => {
  it('renders pace for each split', () => {
    render(<StickerPaceSplits run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('5:42')).toBeInTheDocument()
    expect(screen.getByText('5:35')).toBeInTheDocument()
    expect(screen.getByText('5:28')).toBeInTheDocument()
  })

  it('renders km numbers', () => {
    render(<StickerPaceSplits run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows fallback message when splits is empty', () => {
    render(<StickerPaceSplits run={{ ...run, splits: [] }} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('No split data available')).toBeInTheDocument()
  })

  it('shows at most 8 splits', () => {
    const manySplits = Array.from({ length: 12 }, (_, i) => ({
      km: i + 1,
      pace: '5:30',
      speed: 3.03,
    }))
    render(<StickerPaceSplits run={{ ...run, splits: manySplits }} visible={visible} accent="#FF5A1F" />)
    const rows = document.querySelectorAll('.ovl-ps-row')
    expect(rows).toHaveLength(8)
  })
})
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npm test -- --testPathPattern="StickerPaceSplits" --no-coverage
```

Expected: FAIL — module not found

- [ ] **Step 3: Create `components/stickers/StickerPaceSplits.tsx`**

```tsx
import { type StickerProps } from './types'

export function StickerPaceSplits({ run, accent }: StickerProps) {
  const splits = run.splits.slice(0, 8)
  const maxSpeed = Math.max(...splits.map((s) => s.speed), 0.001)

  if (splits.length === 0) {
    return (
      <div className="ovl ovl-pacesplits">
        <div className="ovl-ps-header">PACE SPLITS</div>
        <div className="ovl-ps-empty">No split data available</div>
      </div>
    )
  }

  return (
    <div className="ovl ovl-pacesplits">
      <div className="ovl-ps-header">PACE SPLITS</div>
      <div className="ovl-ps-rows">
        {splits.map((s) => (
          <div key={s.km} className="ovl-ps-row">
            <span className="ovl-ps-km">{s.km}</span>
            <div className="ovl-ps-bar-track">
              <div
                className="ovl-ps-bar-fill"
                style={{ width: `${(s.speed / maxSpeed) * 100}%`, backgroundColor: accent }}
              />
            </div>
            <span className="ovl-ps-pace">{s.pace}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add CSS to `app/globals.css`**

Append to the end of `app/globals.css`:

```css
/* ============================================================
   STICKER — Pace Splits Bar
   ============================================================ */

.ovl-pacesplits {
  width: 220px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 12px;
}
.ovl-ps-header {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
}
.ovl-ps-rows { display: flex; flex-direction: column; gap: 8px; }
.ovl-ps-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ovl-ps-km {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  width: 12px;
  text-align: right;
  flex-shrink: 0;
}
.ovl-ps-bar-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}
.ovl-ps-bar-fill {
  height: 100%;
  border-radius: 3px;
}
.ovl-ps-pace {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  width: 38px;
  text-align: right;
  flex-shrink: 0;
}
.ovl-ps-empty {
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  padding: 12px 0;
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="StickerPaceSplits" --no-coverage
```

Expected: PASS (4 tests)

- [ ] **Step 6: Run full suite**

```bash
npm test --no-coverage
```

Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add components/stickers/StickerPaceSplits.tsx app/globals.css __tests__/components/StickerPaceSplits.test.tsx
git commit -m "feat: add StickerPaceSplits sticker with per-km bar chart"
```

---

## Task 5: StickerThermalReceipt component + CSS

**Files:**
- Create: `components/stickers/StickerThermalReceipt.tsx`
- Modify: `app/globals.css`
- Create: `__tests__/components/StickerThermalReceipt.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/components/StickerThermalReceipt.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { StickerThermalReceipt } from '@/components/stickers/StickerThermalReceipt'
import type { DisplayActivity } from '@/lib/strava'

const run: DisplayActivity = {
  id: 1, title: 'Morning Run', date: 'May 17',
  distance: '10.2', pace: '5:32', duration: '54:12',
  heartRate: '142', elevation: '88', calories: '612',
  city: 'Jakarta', routeSeed: 3.1, fresh: true,
  splits: [],
}

const visible = {
  distance: true, pace: true, duration: true,
  heartRate: false, elevation: true, calories: false, city: true,
}

describe('StickerThermalReceipt', () => {
  it('renders PACEMARK brand header', () => {
    render(<StickerThermalReceipt run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('PACEMARK')).toBeInTheDocument()
  })

  it('renders activity title', () => {
    render(<StickerThermalReceipt run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('Morning Run')).toBeInTheDocument()
  })

  it('renders distance stat', () => {
    render(<StickerThermalReceipt run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('10.2 KM')).toBeInTheDocument()
  })

  it('renders execution score capped at 100', () => {
    // distance 10.2 → score = Math.min(100, Math.round(10.2 * 10)) = 100
    render(<StickerThermalReceipt run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('100 / 100')).toBeInTheDocument()
  })

  it('renders thank you footer', () => {
    render(<StickerThermalReceipt run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('THANK YOU FOR YOUR RUN')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npm test -- --testPathPattern="StickerThermalReceipt" --no-coverage
```

Expected: FAIL — module not found

- [ ] **Step 3: Create `components/stickers/StickerThermalReceipt.tsx`**

```tsx
import { type StickerProps } from './types'

function Barcode({ seed }: { seed: number }) {
  const rects: { x: number; w: number }[] = []
  let x = 0
  const s = seed * 997
  for (let i = 0; i < 40; i++) {
    const w = ((s * (i + 1) * 0.137) % 2) + 0.8
    if (i % 2 === 0) rects.push({ x: Math.round(x * 10) / 10, w: Math.max(0.8, w) })
    x += w + ((s * (i + 1) * 0.073) % 1.5) + 0.5
  }
  const totalW = Math.ceil(x)
  return (
    <svg
      viewBox={`0 0 ${totalW} 24`}
      preserveAspectRatio="none"
      style={{ width: 120, height: 24, display: 'block' }}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={0} width={r.w} height={24} fill="#1a1a1a" />
      ))}
    </svg>
  )
}

export function StickerThermalReceipt({ run }: StickerProps) {
  const score = Math.min(100, Math.round(parseFloat(run.distance) * 10))

  const rows: [string, string][] = [
    ['DATE', run.date.toUpperCase()],
    ['DISTANCE', `${run.distance} KM`],
    ['AVG PACE', `${run.pace} /KM`],
    ['DURATION', run.duration],
    ['AVG HR', run.heartRate !== '--' ? `${run.heartRate} BPM` : '-- BPM'],
    ['ELEVATION', `+${run.elevation} M`],
    ['CALORIES', run.calories !== '--' ? `${run.calories} CAL` : '-- CAL'],
  ]

  return (
    <div className="ovl-receipt">
      <div className="ovl-rcpt-header">
        <div className="ovl-rcpt-brand">PACEMARK</div>
        <div className="ovl-rcpt-sub">RUN RECEIPT · OFFICIAL RECORD</div>
      </div>
      <div className="ovl-rcpt-divider" />
      <div className="ovl-rcpt-title">{run.title}</div>
      <div className="ovl-rcpt-divider" />
      <div className="ovl-rcpt-rows">
        {rows.map(([k, v]) => (
          <div key={k} className="ovl-rcpt-row">
            <span className="ovl-rcpt-key">{k}</span>
            <span className="ovl-rcpt-val">{v}</span>
          </div>
        ))}
      </div>
      <div className="ovl-rcpt-divider" />
      <div className="ovl-rcpt-score-row">
        <span className="ovl-rcpt-key">EXECUTION SCORE</span>
        <span className="ovl-rcpt-score">{score} / 100</span>
      </div>
      <div className="ovl-rcpt-divider" />
      <div className="ovl-rcpt-barcode-wrap">
        <Barcode seed={run.routeSeed} />
      </div>
      <div className="ovl-rcpt-foot">THANK YOU FOR YOUR RUN</div>
    </div>
  )
}
```

- [ ] **Step 4: Add CSS to `app/globals.css`**

Append to the end of `app/globals.css` (after Pace Splits CSS):

```css
/* ============================================================
   STICKER — Thermal Receipt
   ============================================================ */

.ovl-receipt {
  width: 200px;
  background: #f5f0e8;
  border-radius: 2px;
  padding: 16px 14px 12px;
  font-family: var(--font-mono);
  color: #1a1a1a;
  text-align: center;
}
.ovl-rcpt-header { margin-bottom: 8px; }
.ovl-rcpt-brand {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #0a0a0a;
}
.ovl-rcpt-sub {
  font-size: 7.5px;
  letter-spacing: 0.08em;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 2px;
}
.ovl-rcpt-divider {
  border: none;
  border-top: 1px dashed rgba(0, 0, 0, 0.25);
  margin: 8px 0;
}
.ovl-rcpt-title {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #1a1a1a;
  margin: 4px 0;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ovl-rcpt-rows { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.ovl-rcpt-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.ovl-rcpt-key {
  font-size: 8px;
  letter-spacing: 0.06em;
  color: rgba(0, 0, 0, 0.55);
  flex-shrink: 0;
}
.ovl-rcpt-val {
  font-size: 9px;
  font-weight: 600;
  color: #1a1a1a;
}
.ovl-rcpt-score-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  text-align: left;
}
.ovl-rcpt-score {
  font-size: 10px;
  font-weight: 700;
  color: #0a0a0a;
}
.ovl-rcpt-barcode-wrap {
  display: flex;
  justify-content: center;
  margin: 6px 0 4px;
}
.ovl-rcpt-foot {
  font-size: 7px;
  letter-spacing: 0.1em;
  color: rgba(0, 0, 0, 0.4);
  margin-top: 4px;
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test -- --testPathPattern="StickerThermalReceipt" --no-coverage
```

Expected: PASS (5 tests)

- [ ] **Step 6: Run full suite**

```bash
npm test --no-coverage
```

Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add components/stickers/StickerThermalReceipt.tsx app/globals.css __tests__/components/StickerThermalReceipt.test.tsx
git commit -m "feat: add StickerThermalReceipt sticker with paper receipt style"
```

---

## Task 6: Register new stickers in index.ts

**Files:**
- Modify: `components/stickers/index.ts`

- [ ] **Step 1: Update `components/stickers/index.ts`**

```ts
export * from './types'

import { StickerBigNumber } from './StickerBigNumber'
import { StickerBoldCaps } from './StickerBoldCaps'
import { StickerMonoBlock } from './StickerMonoBlock'
import { StickerSerif } from './StickerSerif'
import { StickerCapsule } from './StickerCapsule'
import { StickerChat } from './StickerChat'
import { StickerExecution } from './StickerExecution'
import { StickerElevation } from './StickerElevation'
import { StickerBattery } from './StickerBattery'
import { StickerRouteData } from './StickerRouteData'
import { StickerPaceSplits } from './StickerPaceSplits'
import { StickerThermalReceipt } from './StickerThermalReceipt'
import type { StickerDef } from './types'

export const STICKER_DEFS: StickerDef[] = [
  { id: 'bignumber',      name: 'Big Number',      desc: 'Hero',          comp: StickerBigNumber },
  { id: 'boldcaps',       name: 'Bold Caps',        desc: 'Three stats',   comp: StickerBoldCaps },
  { id: 'mono',           name: 'Mono Block',       desc: 'Receipt',       comp: StickerMonoBlock },
  { id: 'serif',          name: 'Serif Note',       desc: 'Editorial',     comp: StickerSerif },
  { id: 'capsule',        name: 'Capsule',          desc: 'Location pill', comp: StickerCapsule },
  { id: 'chat',           name: 'Chat',             desc: 'Bubble',        comp: StickerChat },
  { id: 'routedata',      name: 'Route Poly',       desc: 'Map Hero',      comp: StickerRouteData },
  { id: 'execution',      name: 'Execution',        desc: 'Dial',          comp: StickerExecution },
  { id: 'elevation',      name: 'Elevation',        desc: 'Profile',       comp: StickerElevation },
  { id: 'battery',        name: 'Battery',          desc: 'Energy',        comp: StickerBattery },
  { id: 'pacesplits',     name: 'Pace Splits',      desc: 'Per-km bars',   comp: StickerPaceSplits },
  { id: 'thermalreceipt', name: 'Thermal Receipt',  desc: 'Paper receipt', comp: StickerThermalReceipt },
]
```

- [ ] **Step 2: Run full test suite**

```bash
npm test --no-coverage
```

Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add components/stickers/index.ts
git commit -m "feat: register StickerPaceSplits and StickerThermalReceipt in STICKER_DEFS"
```

---

## Self-Review Checklist

- [x] **Spec coverage**: Fix 1 (Web Share) → Task 1+3. Fix 2 (canvas padding) → Task 3. Fix 3 (data model) → Task 2. StickerPaceSplits → Task 4+6. StickerThermalReceipt → Task 5+6.
- [x] **No placeholders**: All steps contain complete code.
- [x] **Type consistency**: `splits: { km: number; pace: string; speed: number }[]` defined in Task 2, used in Task 4. `shareBlobFile` defined in Task 1, imported in Task 3. `copyLabel` state (string) defined and used within Task 3 only.
- [x] **Fixture gap**: Task 2 explicitly updates `StickerBigNumber.test.tsx` fixture. `StickerTile.test.tsx` is fully replaced in Task 3 with updated fixture.
