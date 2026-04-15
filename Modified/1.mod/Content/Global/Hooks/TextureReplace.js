import { ModSystem } from "../../../TL/ModSystem.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ThoriumOreTile } from "../Tiles/ThoriumOreTile.js";
import { LifeQuartzTile } from "../Tiles/LifeQuartzTile.js";
import { ThoriumAnvil } from "../Tiles/ThoriumAnvil.js";
import { LeakyMarineBlock } from "../Tiles/LeakyMarineBlock.js";

export class TextureReplace extends ModSystem {
  constructor() {
    super()
  }
  
  SetupContent() {
      ThoriumOreTile.InjectTexture()
      LifeQuartzTile.InjectTexture()
      ThoriumAnvil.InjectTexture()
      LeakyMarineBlock.InjectTexture()
  }
}

