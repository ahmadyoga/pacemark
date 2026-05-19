import { downloadBlob, shareBlobFile } from '@/lib/export'

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

describe('shareBlobFile', () => {
  const originalShare = (global.navigator as any).share

  afterEach(() => {
    Object.defineProperty(global.navigator, 'share', {
      value: originalShare,
      writable: true,
      configurable: true,
    })
  })

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

  it('throws when navigator.share rejects', async () => {
    const blob = new Blob(['fake-png'], { type: 'image/png' })
    Object.defineProperty(global.navigator, 'share', {
      value: jest.fn().mockRejectedValue(new Error('share_failed')),
      writable: true,
      configurable: true,
    })
    await expect(shareBlobFile(blob)).rejects.toThrow('share_failed')
  })
})
