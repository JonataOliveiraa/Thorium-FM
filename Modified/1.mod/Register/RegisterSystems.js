import { ModSystem } from "../TL/ModSystem.js"

import { TextureReplace } from '../Content/Global/Hooks/TextureReplace.js'
import { gRecipes } from '../Content/Global/gRecipes.js'
import { BloodChamberPersistSystem } from "../Content/Global/BloodChamberPersistSystem.js"
import { ContractSystem } from "../Content/Global/Contracts/ContractSystem.js"

const List = [
  TextureReplace,
  gRecipes,
  BloodChamberPersistSystem,
  ContractSystem
]

export function RegisterSystems() {
  for (const System of List) {
    ModSystem.register(System)
  }
}