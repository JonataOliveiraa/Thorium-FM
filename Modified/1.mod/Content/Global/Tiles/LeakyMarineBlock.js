import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class LeakyMarineBlock extends GlobalTile {
    Type = Terraria.ID.TileID.EasterBlock;

    IsTileSpelunkable(i, j, type) {
        if (type === this.Type) {
            return true;
        }
        return null;
    }

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(24, 45, 94);
        
        Terraria.Main.tileMergeDirt[this.Type] = true;
    }

    static InjectTexture() {
        const EasterBlockTile = Terraria.ID.TileID.EasterBlock;
        const EasterBlockItem = Terraria.ID.ItemID.EasterBlock;

        const leakyMarineItemTexture = tl.texture.load("Textures/TextureReplace/EasterBlock/LeakyMarineBlock_Item.png");
        const leakyMarineTileTexture = tl.texture.load("Textures/TextureReplace/EasterBlock/LeakyMarineBlock_Tile.png");

        if (leakyMarineTileTexture != null) {
            Terraria.Main.tileMergeDirt[EasterBlockTile] = true
            Terraria.GameContent.TextureAssets.Tile[EasterBlockTile].Value = leakyMarineTileTexture;
        }

        if (leakyMarineItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[EasterBlockItem].Value = leakyMarineItemTexture;
        }
    }
}