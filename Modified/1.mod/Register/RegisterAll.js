import { ModSystem } from './../TL/ModSystem.js';
import { ModLoader } from './../TL/Core/ModLoader.js';

import { AutoRegister } from "./AutoRegister.js"

import * as Items from "./RegisterItems.js"
import * as Projectiles from "./RegisterProjectile.js"
import * as Materials from "./RegisterMaterials.js"
import * as Global from "./RegisterGlobal.js"
import * as Buffs from "./RegisterBuffs.js"
import * as Menus from "./RegisterMenu.js"
import * as System from "./RegisterSystem.js"
import * as Biomes from "./RegisterBiome.js"
import * as Backgrounds from "./RegisterBackgrounds.js"
import * as NPC from "./RegisterNPC.js"
import * as Mounts from "./RegisterMounts.js"

export function RegisterAll() {
  ModSystem.register(ModLoader);
  AutoRegister([
    System,
    Backgrounds,
    Biomes,
    Buffs,
    NPC,
    Projectiles,
    Materials,
    Items,
    Menus,
    Mounts,
    Global

  ])
}