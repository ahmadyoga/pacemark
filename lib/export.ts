import html2canvas from 'html2canvas'

export async function stickerToBlob(element: HTMLElement): Promise<Blob> {
  const { width, height } = element.getBoundingClientRect()
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: null,
    useCORS: true,
    logging: false,
    width: width,
    height: height,
    onclone: (clonedDoc) => {
      // Ensure the cloned element is visible and has correct dimensions
      const clonedEl = clonedDoc.querySelector('[ref="captureRef"]') as HTMLElement
      if (clonedEl) {
        clonedEl.style.position = 'relative'
        clonedEl.style.left = '0'
        clonedEl.style.top = '0'
      }
    }
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
