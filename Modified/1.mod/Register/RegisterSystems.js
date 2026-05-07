import { ModSystem } from "../TL/ModSystem.js"

import { TextureReplace } from '../Content/Global/Hooks/TextureReplace.js'
import { gRecipes } from '../Content/Global/gRecipes.js'

const List = [
  TextureReplace,
  gRecipes
]

export function RegisterSystems() {
  for (const System of List) {
    ModSystem.register(System)
  }
}