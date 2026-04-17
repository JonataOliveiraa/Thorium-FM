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

export class TextureReplace extends ModSystem {
  constructor() {
    super()
  }
  
  SetupContent() {
      ThoriumOreTile.InjectTexture()
      LifeQuartzTile.InjectTexture()
      ThoriumAnvil.InjectTexture()

      LeakyMarineBlock.InjectTexture()
      LeakyMarineWall.InjectTexture()
      MossyGoldOreTile.InjectTexture()
      MossyPlatinumOreTile.InjectTexture()
      AquaiteTile.InjectTexture()
      AquamarineTile.InjectTexture()
      DepthSatagmites.InjectTexture()
      MarineBolders.InjectTexture()
  }
}

