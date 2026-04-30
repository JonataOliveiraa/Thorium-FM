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
      DepthSatagmites.InjectTexture()
      MarineBolders.InjectTexture()

      ArcaneArmorFabricator.InjectTexture()
      BloodAltar.InjectTexture()

      ScarletTile.InjectTexture()
      Containers2.InjectTexture()
  }

  PostSetupContent() {
    LifeShieldPlayer.SaveDefaultTextures()
    LifeShieldPlayer.LoadTextures()
  }
}

