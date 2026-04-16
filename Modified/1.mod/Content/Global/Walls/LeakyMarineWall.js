import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class LeakyMarineWall extends GlobalTile {
    Type = Terraria.ID.WallID.EasterBlockWall

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.wallLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(24, 45, 20);
    }

    static InjectTexture() {
        const EasterBlockWall = Terraria.ID.WallID.EasterBlockWall;
        const EasterBlockItem = Terraria.ID.ItemID.EasterBlockWall;

        const easterBlockWallItemTexture = tl.texture.load("Textures/TextureReplace/EasterBlock/LeakyMarineWall_Item.png");
        const easterBlockWallWallTexture = tl.texture.load("Textures/TextureReplace/EasterBlock/MarineWall_Wall.png");

        if (easterBlockWallWallTexture != null) {
            Terraria.GameContent.TextureAssets.Wall[EasterBlockWall].Value = easterBlockWallWallTexture;
        }

        if (easterBlockWallItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[EasterBlockItem].Value = easterBlockWallItemTexture;
        }
    }
}