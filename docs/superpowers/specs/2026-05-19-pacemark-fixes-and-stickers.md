# Pacemark — Bug Fixes & New Stickers

_Date: 2026-05-19_

## Overview

Three fixes to existing functionality plus two new sticker designs.

1. Mobile copy → Web Share API cascade
2. Canvas export transparent padding
3. Data model: per-km splits from Strava
4. New sticker: Pace Splits Bar
5. New sticker: Thermal Receipt

---

## Fix 1: Mobile Copy → Web Share API

### Problem

`navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])` is not supported on iOS Safari. Current catch falls back to `downloadBlob` silently — user taps "Copy", gets a file download with no explanation.

### Solution

Three-step cascade in `StickerTile.tsx` `handleCopy`:

1. Try `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])` — desktop Chrome/Edge
2. Catch → try `navigator.share({ files: [new File([blob], 'pacemark-sticker.png', { type: 'image/png' })] })` — iOS Safari 15+, Android Chrome (native share sheet)
3. Catch → `downloadBlob(blob)` — final fallback

Toast feedback adapts: "Copied", "Shared", or "Saved" depending on path taken.

### Files changed

- `lib/export.ts` — add `shareBlobFile(blob: Blob): Promise<void>`
- `components/ui/StickerTile.tsx` — update `handleCopy` with cascade + adaptive toast

---

## Fix 2: Canvas Export Transparent Padding

### Problem

Hidden capture target renders bare sticker with no padding. Exported PNG has zero whitespace — when dropped into Instagram Stories the sticker sits edge-to-edge with no breathing room.

### Solution

Add `padding: 24px` to the hidden capture wrapper div in `StickerTile.tsx`. `html2canvas` already uses `backgroundColor: null`, so the padding area is transparent in the exported PNG.

Result: exported PNG = sticker + 24px transparent border on all sides. No change to sticker components.

### Files changed

- `components/ui/StickerTile.tsx` — add `padding: 24px` to hidden capture wrapper

---

## Fix 3: Data Model — Per-km Splits

### Problem

Strava's `/activities/{id}` endpoint returns `splits_metric` (per-km breakdown) but `ActivitySummary` doesn't map it, so no sticker can access split data.

### Solution

**`ActivitySummary` (lib/strava.ts)** — add optional field:
```ts
splits_metric?: {
  distance: number
  moving_time: number
  average_speed: number
  pace_zone: number
}[]
```

**`DisplayActivity` (lib/strava.ts)** — add:
```ts
splits: { km: number; pace: string; speed: number }[]
```

**`toDisplayActivity`** — map splits:
```ts
splits: (a.splits_metric ?? []).map((s, i) => ({
  km: i + 1,
  pace: formatPace(s.average_speed),
  speed: s.average_speed,
}))
```

Falls back to `[]` if `splits_metric` absent. No new API route needed.

### Files changed

- `lib/strava.ts` — extend `ActivitySummary`, `DisplayActivity`, `toDisplayActivity`

---

## New Sticker: Pace Splits Bar

**File:** `components/stickers/StickerPaceSplits.tsx`

### Layout

```
┌─────────────────────────────┐
│ PACE SPLITS                 │
│                             │
│  1  ████████████████  5:42  │
│  2  ██████████████    6:01  │
│  3  ████████████████  5:35  │
│  …  (max 8 splits)          │
└─────────────────────────────┘
```

- Dark bg, accent-colored bars
- Bar width proportional to speed: `width = (split.speed / maxSpeed) * 100%` — fastest km = 100% width
- Shows max 8 splits
- Falls back gracefully: "No split data available" if `run.splits` is empty

### CSS classes

`.ovl-pacesplits`, `.ovl-ps-header`, `.ovl-ps-row`, `.ovl-ps-km`, `.ovl-ps-bar-track`, `.ovl-ps-bar-fill`, `.ovl-ps-pace`

---

## New Sticker: Thermal Receipt

**File:** `components/stickers/StickerThermalReceipt.tsx`

### Layout

```
┌─────────────────────────────┐
│         PACEMARK            │
│  RUN RECEIPT · OFFICIAL     │
│  - - - - - - - - - - - - -  │
│  [Activity Title]           │
│  - - - - - - - - - - - - -  │
│  DATE          18 May 2026  │
│  DISTANCE          10.2 KM  │
│  AVG PACE        5:42 /KM   │
│  DURATION           52:14   │
│  AVG HR             148 BPM │
│  ELEVATION            +82 M │
│  CALORIES           420 CAL │
│  - - - - - - - - - - - - -  │
│  EXECUTION SCORE   82 / 100 │
│  - - - - - - - - - - - - -  │
│  ▐▌▌▐▐▌▌▐▌▐▐▌▌▐▌▐▐▌▌▐▌▐▐   │
│  THANK YOU FOR YOUR RUN     │
└─────────────────────────────┘
```

- White/cream self-contained background (not transparent overlay) — looks the same regardless of stage bg setting
- Dark text throughout (not white)
- Execution score: `Math.min(100, Math.round(parseFloat(run.distance) * 10))` — simple proxy
- Barcode: SVG with variable-width vertical bars seeded from `run.routeSeed` for deterministic output

### CSS classes

`.ovl-receipt`, `.ovl-rcpt-header`, `.ovl-rcpt-brand`, `.ovl-rcpt-sub`, `.ovl-rcpt-divider`, `.ovl-rcpt-title`, `.ovl-rcpt-row`, `.ovl-rcpt-key`, `.ovl-rcpt-val`, `.ovl-rcpt-score`, `.ovl-rcpt-barcode`, `.ovl-rcpt-foot`

---

## index.ts Changes

Add to `STICKER_DEFS`:
```ts
{ id: 'pacesplits',     name: 'Pace Splits',     desc: 'Per-km bars',   comp: StickerPaceSplits },
{ id: 'thermalreceipt', name: 'Thermal Receipt',  desc: 'Paper receipt', comp: StickerThermalReceipt },
```

---

## Files Changed Summary

| File | Change |
|------|--------|
| `lib/strava.ts` | Add `splits_metric` to `ActivitySummary`, `splits` to `DisplayActivity`, map in `toDisplayActivity` |
| `lib/export.ts` | Add `shareBlobFile()` |
| `components/ui/StickerTile.tsx` | Cascade copy→share→download, adaptive toast, capture padding |
| `components/stickers/StickerPaceSplits.tsx` | New sticker |
| `components/stickers/StickerThermalReceipt.tsx` | New sticker |
| `components/stickers/index.ts` | Register both new stickers |
| `app/globals.css` | CSS for both new stickers + light-mode overrides for receipt |
