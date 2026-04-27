import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class BloodAltar extends GlobalTile {
    Type = Terraria.ID.TileID.HoneyDispenser;

    static InjectTexture() {
        const HoneyDispenserTile = Terraria.ID.TileID.HoneyDispenser;
        const HoneyDispenserItem = Terraria.ID.ItemID.HoneyDispenser;

        const bloodAltarItemTexture = tl.texture.load("Textures/TextureReplace/HoneyDispenser/BloodAltar_Item.png");
        const bloodAltarTileTexture = tl.texture.load("Textures/TextureReplace/HoneyDispenser/BloodAltar_Tile.png");
        const bloodAltarOutlineTexture = tl.texture.load("Textures/TextureReplace/HoneyDispenser/BloodAltar_Highlight.png")

        if (bloodAltarTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[HoneyDispenserTile].Value = bloodAltarTileTexture;
        }

        if (HoneyDispenserItem != null) {
            Terraria.GameContent.TextureAssets.Item[HoneyDispenserItem].Value = bloodAltarItemTexture;
        }

        if(bloodAltarOutlineTexture != null) {
            Terraria.GameContent.TextureAssets.HighlightMask[HoneyDispenserTile].Value = bloodAltarOutlineTexture
        }
    }
}

//HoneyDispenser