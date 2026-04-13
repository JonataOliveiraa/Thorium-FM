import { ModSystem } from "../../../TL/ModSystem.js";
import { Terraria } from '../../../TL/ModImports.js';

export class TextureReplace extends ModSystem {
  constructor() {
    super()
  }
  
  SetupContent() {
      //Opal Ore
      const TeamBlockRedTile = Terraria.ID.TileID.TeamBlockRed;
      const TeamBlockRedItem = Terraria.ID.ItemID.TeamBlockRed;

      const opalTileTexture = tl.texture.load("Textures/TextureReplace/TeamBlockRed/OpalOre_Tile.png");
      const opalItemTexture = tl.texture.load("Textures/TextureReplace/TeamBlockRed/OpalOre_Item.png");

      if (opalTileTexture != null) {
          Terraria.Main.tileMergeDirt[TeamBlockRedTile] = true
          Terraria.GameContent.TextureAssets.Tile[TeamBlockRedTile].Value = opalTileTexture;
      }

      if (opalItemTexture != null) {
          Terraria.GameContent.TextureAssets.Item[TeamBlockRedItem].Value = opalItemTexture;
      }
  }
  
}