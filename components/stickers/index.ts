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
import { StickerPaceSplits } from './StickerPaceSplits'
import { StickerThermalReceipt } from './StickerThermalReceipt'
import { StickerMapOnly } from './StickerMapOnly'
import { StickerMapStats } from './StickerMapStats'
import { StickerMapPanel } from './StickerMapPanel'
import { StickerGlowSplits } from './StickerGlowSplits'
import { StickerStaggeredStrips } from './StickerStaggeredStrips'
import { StickerTerminal } from './StickerTerminal'
import { StickerVerticalRun } from './StickerVerticalRun'
import { StickerGhostStats } from './StickerGhostStats'
import type { StickerDef } from './types'

export const STICKER_DEFS: StickerDef[] = [
  { id: 'bignumber',      name: 'Big Number',      desc: 'Hero',          comp: StickerBigNumber },
  { id: 'boldcaps',       name: 'Bold Caps',        desc: 'Three stats',   comp: StickerBoldCaps },
  { id: 'mono',           name: 'Mono Block',       desc: 'Receipt',       comp: StickerMonoBlock },
  { id: 'serif',          name: 'Serif Note',       desc: 'Editorial',     comp: StickerSerif },
  { id: 'capsule',        name: 'Capsule',          desc: 'Location pill', comp: StickerCapsule },
  { id: 'chat',           name: 'Chat',             desc: 'Bubble',        comp: StickerChat },
  { id: 'routedata',      name: 'Route Poly',       desc: 'Map Hero',      comp: StickerRouteData },
  { id: 'execution',      name: 'Execution',        desc: 'Dial',          comp: StickerExecution },
  { id: 'elevation',      name: 'Elevation',        desc: 'Profile',       comp: StickerElevation },
  { id: 'battery',        name: 'Battery',          desc: 'Energy',        comp: StickerBattery },
  { id: 'pacesplits',     name: 'Pace Splits',      desc: 'Per-km bars',   comp: StickerPaceSplits },
  { id: 'thermalreceipt', name: 'Thermal Receipt',  desc: 'Paper receipt', comp: StickerThermalReceipt },
  { id: 'maponly',        name: 'Map Only',         desc: 'Route art',     comp: StickerMapOnly },
  { id: 'mapstats',       name: 'Map + Stats',      desc: 'Route + bar',   comp: StickerMapStats },
  { id: 'mappanel',       name: 'Map Panel',        desc: 'Route + panel', comp: StickerMapPanel },
  { id: 'glowsplits',     name: 'Glow Splits',      desc: 'Opacity bars',  comp: StickerGlowSplits },
  { id: 'strips',         name: 'Strips',           desc: 'Staggered',     comp: StickerStaggeredStrips },
  { id: 'terminal',       name: 'Terminal',         desc: 'CLI style',     comp: StickerTerminal },
  { id: 'vertrun',        name: 'Vertical Run',     desc: 'Stack numbers', comp: StickerVerticalRun },
  { id: 'ghost',          name: 'Ghost Stats',      desc: 'Frosted glow',  comp: StickerGhostStats },
]
