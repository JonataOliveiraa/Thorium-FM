import { GlobalHooks } from "../TL/GlobalHooks.js"
import { ModPlayer } from "../TL/ModPlayer.js"
import { GlobalLoot } from "../TL/GlobalLoot.js"
import { GlobalTile } from "../TL/GlobalTile.js"
import { GlobalNPC } from "../TL/GlobalNPC.js"

// Hooks
import { gHooks } from '../Content/Global/gHooks.js'
import { ChangeShimmerPos } from '../Content/Global/Hooks/ChangeShimmerPos.js'
import { WorldInteraction } from '../Content/Global/Hooks/WorldInteraction.js'
import { OreInjection } from '../Content/Global/Hooks/OreInjection.js'
import { PropsReplace } from '../Content/Global/Hooks/PropsReplace.js'
import { ToolTipsReplace } from '../Content/Global/Hooks/ToolTipsReplace.js'
import { RemoveItemsRecipes } from '../Content/Global/Hooks/RemoveItemsRecipes.js'

// Players
import { LifeShieldPlayer } from '../Content/Global/LifeShieldPlayer.js'
import { ThoriumPlayer } from '../Content/Global/ThoriumPlayer.js'

// Loot
import { gNPCsLoot } from '../Content/Global/gNPCsLoot.js'
import { gTilesLoot } from '../Content/Global/gTilesLoot.js'

// Tiles
import { LifeQuartzTile } from '../Content/Global/Tiles/LifeQuartzTile.js'
import { ThoriumOreTile } from '../Content/Global/Tiles/ThoriumOreTile.js'
import { ThoriumAnvil } from '../Content/Global/Tiles/ThoriumAnvil.js'
import { AquaiteTile } from '../Content/Global/Tiles/AquaiteTile.js'
import { LeakyMarineBlock } from '../Content/Global/Tiles/LeakyMarineBlock.js'
import { LeakyMossyMarineBlock } from '../Content/Global/Tiles/LeakyMossyMarineBlock.js'
import { MossyPlatinumOreTile } from '../Content/Global/Tiles/MossyPlatinumOreTile.js'
import { MossyGoldOreTile } from '../Content/Global/Tiles/MossyGoldOreTile.js'
import { MarineBolders } from '../Content/Global/Tiles/MarineBolders.js'
import { BloodAltar } from '../Content/Global/Tiles/BloodAltar.js'
import { ScarletTile } from '../Content/Global/Tiles/ScarletTile.js'

// Walls
import { LeakyMarineWall } from '../Content/Global/Walls/LeakyMarineWall.js'

// NPCs
import { UpdateNPCBuff } from '../Content/Global/NPCs/UpdateNPCBuff.js'
import { ItemsClassIcon } from "../Content/Global/Hooks/ItemsClassIcon.js"
import { GrimAstroturf } from "../Content/Global/Tiles/GrimAstroturf.js"
import { BigTilesNoDrop } from "../Content/Global/Hooks/BigTilesNoDrop.js"
import { AncientPhylactery } from "../Content/Global/Tiles/AncientPhylactery.js"
import { MarkedGrave } from "../Content/Global/Tiles/MarkedGrave.js"
import { TileDustReplace } from "../Content/Global/Hooks/TileDustReplace.js"
import { ArcaneArmorFabricator } from "../Content/Global/Tiles/ArcaneArmorFabricator.js"
import { DrawWorldCursor } from "../Content/Global/Hooks/DrawWorldCursor.js"

const List = [
  // GlobalHooks
  gHooks,
  ChangeShimmerPos,
  WorldInteraction,
  OreInjection,
  PropsReplace,
  ToolTipsReplace,
  RemoveItemsRecipes,
  BigTilesNoDrop,
  TileDustReplace,
  DrawWorldCursor,
  
  // ModPlayer
  LifeShieldPlayer,
  ThoriumPlayer,
  
  // GlobalLoot
  gNPCsLoot,
  gTilesLoot,
  
  // GlobalTile
  LifeQuartzTile,
  ThoriumOreTile,
  ThoriumAnvil,
  ArcaneArmorFabricator,
  AquaiteTile,
  LeakyMarineBlock,
  LeakyMossyMarineBlock,
  MossyPlatinumOreTile,
  MossyGoldOreTile,
  MarineBolders,
  BloodAltar,
  AncientPhylactery,
  MarkedGrave,
  ScarletTile,
  LeakyMarineWall,
  GrimAstroturf,
  
  // GlobalNPC
  UpdateNPCBuff,

  //Tests
  ItemsClassIcon
]

export function RegisterGlobal() {
  for (const Global of List) {
    if (Global.prototype instanceof GlobalHooks) {
      GlobalHooks.register(Global)
    } else if (Global.prototype instanceof ModPlayer) {
      ModPlayer.register(Global)
    } else if (Global.prototype instanceof GlobalLoot) {
      GlobalLoot.register(Global)
    } else if (Global.prototype instanceof GlobalTile) {
      GlobalTile.register(Global)
    } else if (Global.prototype instanceof GlobalNPC) {
      GlobalNPC.register(Global)
    }
  }
}