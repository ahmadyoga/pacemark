import type { DisplayActivity } from '@/lib/strava'
import type { ComponentType } from 'react'

export interface VisibleMetrics {
  distance: boolean
  pace: boolean
  duration: boolean
  heartRate: boolean
  elevation: boolean
  calories: boolean
  city: boolean
  rounded?: boolean
}

export interface StickerProps {
  run: DisplayActivity
  visible: VisibleMetrics
  accent: string
}

export interface StickerDef {
  id: string
  name: string
  desc: string
  comp: ComponentType<StickerProps>
}

export const VISIBLE_LABELS: Record<Exclude<keyof VisibleMetrics, 'rounded'>, string> = {
  distance: 'Distance',
  pace: 'Pace',
  duration: 'Duration',
  heartRate: 'Heart Rate',
  elevation: 'Elevation',
  calories: 'Calories',
  city: 'City',
}

export function statList(
  run: DisplayActivity,
  visible: VisibleMetrics
): [string, string][] {
  const arr: [string, string][] = []
  if (visible.distance) arr.push(['DIST', `${run.distance} km`])
  if (visible.pace) arr.push(['PACE', `${run.pace}/km`])
  if (visible.duration) arr.push(['TIME', run.duration])
  if (visible.heartRate) arr.push(['HR', `${run.heartRate} bpm`])
  if (visible.elevation) arr.push(['ELEV', `+${run.elevation} m`])
  if (visible.calories) arr.push(['KCAL', run.calories])
  return arr
}
