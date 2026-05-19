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
