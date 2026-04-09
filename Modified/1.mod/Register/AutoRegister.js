import { ModItem } from "./../TL/ModItem.js"
import { ModProjectile } from "./../TL/ModProjectile.js"

export function AutoRegister(mod) {
  if (typeof mod === "function") {
    if (mod.prototype instanceof ModProjectile) ModProjectile.register(mod)
    else if (mod.prototype instanceof ModItem) ModItem.register(mod)
    else try { mod() } catch { }
  } else if (typeof mod === "object" && mod !== null) {
    for (const key in mod) {
      AutoRegister(mod[key])
    }
  }
}