import { domToBlob } from 'modern-screenshot'

// Transparent breathing room baked around every exported sticker so drop-shadows,
// glyph descenders and the final split row are never clipped at the PNG edge.
const EXPORT_PAD = 16

export async function stickerToBlob(element: HTMLElement): Promise<Blob> {
  const { width, height } = element.getBoundingClientRect()

  // Suppress the ancestor drop-shadow so it doesn't bleed into the transparent PNG.
  const stageInner = element.closest<HTMLElement>('.tile-stage-inner')
  const prevFilter = stageInner?.style.filter ?? ''
  if (stageInner) stageInner.style.filter = 'none'

  // .is-export strips box-shadow, padding and margin from the sticker wrapper and all
  // child .ovl* nodes so the PNG has zero extra whitespace / glow bleed. It also swaps
  // backdrop-filter cards for solid equivalents: modern-screenshot rasterises through an
  // SVG <foreignObject>, which (like html2canvas) cannot render backdrop-filter — there
  // is no backdrop behind the node inside the SVG — so the fallbacks stay required.
  element.classList.add('is-export')

  // Auto-detect whether the sticker has its own opaque background.
  // Transparent-overlay stickers (Big Number, Bold Caps, VHS, etc.) use white text
  // with no card background — they look correct on the dark checker stage but export
  // as an invisible transparent PNG when viewed in any white-background context.
  // For these we bake in the checker's dark colour (#1a1a1f) so the export is usable
  // as a standalone graphic. Stickers with their own card background keep null so the
  // card shape clips cleanly at the PNG boundary.
  const stickerRoot = element.firstElementChild as HTMLElement | null
  const computedBg = stickerRoot ? getComputedStyle(stickerRoot).backgroundColor : 'rgba(0,0,0,0)'
  const isTransparent =
    !computedBg ||
    computedBg === 'transparent' ||
    computedBg === 'rgba(0, 0, 0, 0)'
  const backgroundColor = isTransparent ? '#1a1a1f' : null

  try {
    // modern-screenshot serialises the live node into an SVG <foreignObject> and lets
    // the browser render it. Unlike html2canvas (which re-implements layout and drifts
    // on line-height / flex vertical rhythm at scale), the browser reproduces the exact
    // text metrics the user sees in the preview — so the PNG matches the preview.
    //
    // Pin the box to the live size + EXPORT_PAD on every side. Under
    // `box-sizing: border-box` the grown width/height keep the content area exactly
    // equal to the live sticker, so the padding becomes transparent breathing room
    // (no squeeze, no clip) — drop-shadows, glyph descenders and the final split row
    // all clear the PNG edge. Child margins are preserved (see .is-export in
    // globals.css), so the card fills this height with no dead gap.
    return await domToBlob(element, {
      scale: 4,
      backgroundColor,
      width: width + EXPORT_PAD * 2,
      height: height + EXPORT_PAD * 2,
      style: { padding: `${EXPORT_PAD}px` },
      type: 'image/png',
    })
  } finally {
    // Always restore — even if capture throws — so the live preview is never
    // left in a broken state.
    element.classList.remove('is-export')
    if (stageInner) stageInner.style.filter = prevFilter
  }
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

export async function shareBlobFile(blob: Blob, filename = 'pacemark-sticker.png'): Promise<void> {
  const file = new File([blob], filename, { type: 'image/png' })
  await navigator.share({ files: [file] })
}

/**
 * Build a download-safe filename for an exported sticker, e.g.
 * `pacemark-summit-morning-run-10.0km.png`. Falls back to the generic name when run/def missing.
 */
export function stickerFilename(opts: { stickerId: string; title: string; distance: string }): string {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40) || 'run'
  return `pacemark-${slug(opts.stickerId)}-${slug(opts.title)}-${opts.distance}km.png`
}
