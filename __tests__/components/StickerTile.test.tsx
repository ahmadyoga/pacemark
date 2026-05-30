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
  stickerFilename: jest.fn().mockReturnValue('pacemark-test.png'),
}))

const run: DisplayActivity = {
  id: 1, title: 'Morning Run', date: 'May 17',
  distance: '10.2', pace: '5:32', duration: '54:12',
  heartRate: '142', elevation: '88', calories: '612',
  city: 'Jakarta', routeSeed: 3.1, routePoints: [[10, 10], [50, 50], [90, 90]], elevationProfile: [], fresh: true,
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
    render(<StickerTile def={def} run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('Big Number')).toBeInTheDocument()
  })

  it('shows Copied when clipboard write succeeds', async () => {
    render(<StickerTile def={def} run={run} visible={visible} accent="#FF5A1F" />)
    fireEvent.click(screen.getByText('Copy'))
    await waitFor(() => expect(screen.getByText('Copied')).toBeInTheDocument())
  })

  it('shows Shared when clipboard fails but navigator.share succeeds', async () => {
    ;(exportLib.copyBlobToClipboard as jest.Mock).mockRejectedValue(new Error('not supported'))
    render(<StickerTile def={def} run={run} visible={visible} accent="#FF5A1F" />)
    fireEvent.click(screen.getByText('Copy'))
    await waitFor(() => expect(screen.getByText('Shared')).toBeInTheDocument())
  })

  it('calls downloadBlob when both clipboard and share fail', async () => {
    ;(exportLib.copyBlobToClipboard as jest.Mock).mockRejectedValue(new Error('not supported'))
    ;(exportLib.shareBlobFile as jest.Mock).mockRejectedValue(new Error('not supported'))
    render(<StickerTile def={def} run={run} visible={visible} accent="#FF5A1F" />)
    fireEvent.click(screen.getByText('Copy'))
    await waitFor(() => expect(exportLib.downloadBlob).toHaveBeenCalled())
  })
})
