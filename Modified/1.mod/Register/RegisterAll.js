import { ModSystem } from './../TL/ModSystem.js';
import { ModLoader } from './../TL/Core/ModLoader.js';

import { AutoRegister } from "./AutoRegister.js"

import * as Items from "./RegisterItems.js"
import * as Projectiles from "./RegisterProjectile.js"
import * as Materials from "./RegisterMaterials.js"
import * as Global from "./RegisterGlobal.js"
import * as Buffs from "./RegisterBuffs.js"
export function RegisterAll() {
  ModSystem.register(ModLoader);
  AutoRegister([
    Buffs,
    Projectiles,
    Materials,
    Items,
    Global
  ])
}