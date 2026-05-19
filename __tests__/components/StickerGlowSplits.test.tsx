import { render, screen } from '@testing-library/react'
import { StickerGlowSplits } from '@/components/stickers/StickerGlowSplits'
import type { DisplayActivity } from '@/lib/strava'

const run: DisplayActivity = {
  id: 1, title: 'Morning Run', date: 'May 17',
  distance: '10.2', pace: '5:32', duration: '54:12',
  heartRate: '142', elevation: '88', calories: '612',
  city: 'Jakarta', routeSeed: 3.1, fresh: true,
  splits: [
    { km: 1, pace: '5:42', speed: 2.92, roundedKm: 1 },
    { km: 2, pace: '5:35', speed: 2.99, roundedKm: 2 },
    { km: 3, pace: '5:28', speed: 3.05, roundedKm: 0 }, // Small split
  ],
}

const visible = {
  distance: true, pace: true, duration: true,
  heartRate: false, elevation: true, calories: false, city: true,
  rounded: false,
}

describe('StickerGlowSplits', () => {
  it('renders pace for each split', () => {
    render(<StickerGlowSplits run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('5:42')).toBeInTheDocument()
    expect(screen.getByText('5:35')).toBeInTheDocument()
    expect(screen.getByText('5:28')).toBeInTheDocument()
  })

  it('renders km numbers by default', () => {
    render(<StickerGlowSplits run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('hides small splits when rounded is true', () => {
    render(<StickerGlowSplits run={run} visible={{ ...visible, rounded: true }} accent="#FF5A1F" />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.queryByText('3')).not.toBeInTheDocument()
    expect(screen.queryByText('5:28')).not.toBeInTheDocument() // Pace for small split
    expect(screen.queryByText('—')).not.toBeInTheDocument()
  })

  it('shows fallback message when splits is empty', () => {
    render(<StickerGlowSplits run={{ ...run, splits: [] }} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('No split data')).toBeInTheDocument()
  })
})
