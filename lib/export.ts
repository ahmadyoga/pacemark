import html2canvas from 'html2canvas'

export async function stickerToBlob(element: HTMLElement): Promise<Blob> {
  const { width, height } = element.getBoundingClientRect()
  const canvas = await html2canvas(element, {
    scale: 4,
    backgroundColor: null,
    useCORS: true,
    logging: false,
    width: width,
    height: height,
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
