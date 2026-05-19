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
