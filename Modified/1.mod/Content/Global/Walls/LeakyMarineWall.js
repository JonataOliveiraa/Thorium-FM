import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class LeakyMarineWall extends GlobalTile {
    Type = Terraria.ID.WallID.PoopWall

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.wallLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(24, 45, 20);
    }

    static InjectTexture() {
        const PoopWall = Terraria.ID.WallID.PoopWall;
        const EasterBlockItem = Terraria.ID.ItemID.PoopWall;

        const poopWallItemTexture = tl.texture.load("Textures/TextureReplace/PoopWall/LeakyMarineWall_Item.png");
        const poopWallWallTexture = tl.texture.load("Textures/TextureReplace/PoopWall/MarineWall_Wall.png");

        if (poopWallWallTexture != null) {
            Terraria.GameContent.TextureAssets.Wall[PoopWall].Value = poopWallWallTexture;
        }

        if (poopWallItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[EasterBlockItem].Value = poopWallItemTexture;
        }
    }
}