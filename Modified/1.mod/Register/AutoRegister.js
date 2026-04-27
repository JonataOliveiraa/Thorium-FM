import { ModItem } from "./../TL/ModItem.js"
import { ModProjectile } from "./../TL/ModProjectile.js"
import { ModPlayer } from './../TL/ModPlayer.js';
import { GlobalHooks } from './../TL/GlobalHooks.js';
import { ModBuff } from './../TL/ModBuff.js'
import { ModMenu } from "../TL/ModMenu.js";
import { ModSystem } from "../TL/ModSystem.js";
import { GlobalLoot } from "../TL/GlobalLoot.js";
import { GlobalTile } from "../TL/GlobalTile.js";
import { ModBiome } from "../TL/ModBiome.js";
import { ModSurfaceBackground } from "../TL/ModBackgrounds.js";
import { UndergroundBackgroundLoader } from "../TL/Loaders/BackgroundLoaders.js";
import { ModNPC } from "../TL/ModNPC.js";
import { GlobalNPC } from "../TL/GlobalNPC.js";
import { ModMount } from "../TL/ModMount.js";

export function AutoRegister(mod) {
  if (typeof mod === "function") {
    if (mod.prototype instanceof ModSystem) ModSystem.register(mod)
    else if (mod.prototype instanceof ModSurfaceBackground) ModSurfaceBackground.register(mod)
    else if (mod.prototype instanceof UndergroundBackgroundLoader) UndergroundBackgroundLoader.register(mod)
    else if (mod.prototype instanceof ModBiome) ModBiome.register(mod)
    else if (mod.prototype instanceof ModProjectile) ModProjectile.register(mod)
    else if (mod.prototype instanceof ModItem) ModItem.register(mod)
    else if (mod.prototype instanceof ModMenu) ModMenu.register(mod)
    else if (mod.prototype instanceof ModPlayer) ModPlayer.register(mod)
    else if (mod.prototype instanceof ModBuff) ModBuff.register(mod)
    else if (mod.prototype instanceof ModMount) ModMount.register(mod)
    else if (mod.prototype instanceof ModNPC) ModNPC.register(mod)
    else if (mod.prototype instanceof GlobalLoot) GlobalLoot.register(mod)
    else if (mod.prototype instanceof GlobalTile) GlobalTile.register(mod)
    else if (mod.prototype instanceof GlobalNPC) GlobalNPC.register(mod)
    else if (mod.prototype instanceof GlobalHooks) GlobalHooks.register(mod)
    else try { mod() } catch { }
  } else if (typeof mod === "object" && mod !== null) {
    for (const key in mod) {
      AutoRegister(mod[key])
    }
  }
}