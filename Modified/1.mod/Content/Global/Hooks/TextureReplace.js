import { ModSystem } from "../../../TL/ModSystem.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ThoriumOreTile } from "../Tiles/ThoriumOreTile.js";
import { LifeQuartzTile } from "../Tiles/LifeQuartzTile.js";
import { ThoriumAnvil } from "../Tiles/ThoriumAnvil.js";
import { LeakyMarineBlock } from "../Tiles/LeakyMarineBlock.js";
import { LeakyMarineWall } from "../Walls/LeakyMarineWall.js";
import { MossyGoldOreTile } from "../Tiles/MossyGoldOreTile.js";
import { MossyPlatinumOreTile } from "../Tiles/MossyPlatinumOreTile.js";
import { AquaiteTile } from "../Tiles/AquaiteTile.js";
import { AquamarineTile } from "../Tiles/AquamarineTile.js";
import { DepthSatagmites } from "../Tiles/DepthSatagmites.js";
import { MarineBolders } from "../Tiles/MarineBolders.js";
import { ArcaneArmorFabricator } from "../Tiles/ArcaneArmorFabricator.js";
import { ScarletTile } from "../Tiles/ScarletTile.js";
import { Containers2 } from "../Tiles/Containers2.js";
import { BloodAltar } from "../Tiles/BloodAltar.js";
import { LifeShieldPlayer } from "../LifeShieldPlayer.js";
import { ModTexture } from "../../../TL/ModTexture.js";
import { LeakyMossyMarineBlock } from "../Tiles/LeakyMossyMarineBlock.js";
import { OpalTile } from "../Tiles/OpalTile.js";
import { DepthsAquamarineTile } from "../Tiles/DepthsAquamarineTile.js";
import { BardEmblem } from "../Items/BardEmblem.js";
import { ClericEmblem } from "../Items/ClericEmblem.js";
import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { ModItem } from "../../../TL/ModItem.js";
import { GrimAstroturf } from "../Tiles/GrimAstroturf.js";
import { AncientPhylactery } from "../Tiles/AncientPhylactery.js";
import { MarkedGrave } from "../Tiles/MarkedGrave.js";

export class TextureReplace extends ModSystem {
  constructor() {
    super()
  }

  static _CustomTextures = new Map()
  
  SetupContent() {
      Containers2.InjectTexture()

      ThoriumOreTile.InjectTexture()
      LifeQuartzTile.InjectTexture()
      ThoriumAnvil.InjectTexture()

      LeakyMarineBlock.InjectTexture()
      LeakyMossyMarineBlock.InjectTexture()
      LeakyMarineWall.InjectTexture()
      MossyGoldOreTile.InjectTexture()
      MossyPlatinumOreTile.InjectTexture()
      AquaiteTile.InjectTexture()
      AquamarineTile.InjectTexture()
      DepthsAquamarineTile.InjectTexture()
      OpalTile.InjectTexture()
      DepthSatagmites.InjectTexture()
      MarineBolders.InjectTexture()

      ArcaneArmorFabricator.InjectTexture()
      BloodAltar.InjectTexture()
      AncientPhylactery.InjectTexture()
      MarkedGrave.InjectTexture()

      ScarletTile.InjectTexture()
      Containers2.InjectTexture()

      BardEmblem.InjectTexture()
      ClericEmblem.InjectTexture()
      GrimAstroturf.InjectTexture()
  }

  PostSetupContent() {
    LifeShieldPlayer.SaveDefaultTextures()
    LifeShieldPlayer.LoadTextures()

    //Loading Items Type
    ModHealerItem.healerItemsName = new Set([...ModHealerItem.healerItemsName].map(str => ModItem.getTypeByName(str)))
  }
}

