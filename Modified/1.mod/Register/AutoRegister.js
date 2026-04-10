import { ModItem } from "./../TL/ModItem.js"
import { ModProjectile } from "./../TL/ModProjectile.js"
import { ModPlayer } from './../TL/ModPlayer.js';
import { GlobalHooks } from './../TL/GlobalHooks.js';
import { ModBuff } from "../TL/ModBuff.js";

export function AutoRegister(mod) {
  if (typeof mod === "function") {
    if (mod.prototype instanceof ModBuff) ModBuff.register(mod)
    else if (mod.prototype instanceof ModProjectile) ModProjectile.register(mod)
    else if (mod.prototype instanceof ModItem) ModItem.register(mod)
    else if (mod.prototype instanceof ModPlayer) ModPlayer.register(mod)
    else if (mod.prototype instanceof GlobalHooks) GlobalHooks.register(mod)
    else try { mod() } catch { }
  } else if (typeof mod === "object" && mod !== null) {
    for (const key in mod) {
      AutoRegister(mod[key])
    }
  }
}