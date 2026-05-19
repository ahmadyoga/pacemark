export * from './types'

import { StickerBigNumber } from './StickerBigNumber'
import { StickerBoldCaps } from './StickerBoldCaps'
import { StickerMonoBlock } from './StickerMonoBlock'
import { StickerSerif } from './StickerSerif'
import { StickerCapsule } from './StickerCapsule'
import { StickerChat } from './StickerChat'
import { StickerExecution } from './StickerExecution'
import { StickerElevation } from './StickerElevation'
import { StickerBattery } from './StickerBattery'
import { StickerRouteData } from './StickerRouteData'
import type { StickerDef } from './types'

export const STICKER_DEFS: StickerDef[] = [
  { id: 'bignumber', name: 'Big Number', desc: 'Hero', comp: StickerBigNumber },
  { id: 'boldcaps',  name: 'Bold Caps',  desc: 'Three stats', comp: StickerBoldCaps },
  { id: 'mono',      name: 'Mono Block', desc: 'Receipt', comp: StickerMonoBlock },
  { id: 'serif',     name: 'Serif Note', desc: 'Editorial', comp: StickerSerif },
  { id: 'capsule',   name: 'Capsule',    desc: 'Location pill', comp: StickerCapsule },
  { id: 'chat',      name: 'Chat',       desc: 'Bubble', comp: StickerChat },
  { id: 'routedata', name: 'Route Poly', desc: 'Map Hero', comp: StickerRouteData },
  { id: 'execution', name: 'Execution',  desc: 'Dial', comp: StickerExecution },
  { id: 'elevation', name: 'Elevation',  desc: 'Profile', comp: StickerElevation },
  { id: 'battery',   name: 'Battery',    desc: 'Energy', comp: StickerBattery },
]
