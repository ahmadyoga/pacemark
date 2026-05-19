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
