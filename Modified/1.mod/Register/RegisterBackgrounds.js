import { ModSurfaceBackground } from "../TL/ModBackgrounds.js"
import { ModUndergroundBackground } from "../TL/ModBackgrounds.js"

// Backgrounds
import { AquaticDepthsSurface_BG } from "../Content/Backgrounds/AquaticDepthsUG_BG.js"
import { AquaticDepthsUG_BG } from "../Content/Backgrounds/AquaticDepthsUG_BG.js"

const ListSurface = [
  AquaticDepthsSurface_BG
]

const ListUnderground = [
  AquaticDepthsUG_BG
]

export function RegisterBackgrounds() {
  for (const Background of ListSurface) {
    ModSurfaceBackground.register(Background)
  }
  for (const Background of ListUnderground) {
    ModUndergroundBackground.register(Background)
  }
}