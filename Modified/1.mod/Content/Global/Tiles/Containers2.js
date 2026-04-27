import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class Containers2 extends GlobalTile {
    static InjectTexture() {
        const LesionChestItem = Terraria.ID.ItemID.LesionChest;
        const GolfChestItem = Terraria.ID.ItemID.GolfChest;
        const Containers2Tile = Terraria.ID.TileID.Containers2;

        const Containers2Texture = tl.texture.load("Textures/TextureReplace/Containers2/Containers2.png");

        if (Containers2Texture != null) {
            Terraria.GameContent.TextureAssets.Tile[Containers2Tile].Value = Containers2Texture;
        }

        //Item Texture
        const depthChestItemTexture = tl.texture.load("Textures/TextureReplace/Containers2/Items/DepthChest.png");
        const scarletChestItemTexture = tl.texture.load("Textures/TextureReplace/Containers2/Items/ScarletChest.png");

        if (depthChestItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[LesionChestItem].Value = depthChestItemTexture;
        }
        if (scarletChestItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[GolfChestItem].Value = scarletChestItemTexture;
        }
    }
}