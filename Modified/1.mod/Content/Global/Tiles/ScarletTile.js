import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class ScarletTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    Type = Terraria.ID.TileID.AncientMythrilBrick;

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(228, 50, 51);

        Terraria.Main.tileShine[this.Type] = 300;
        Terraria.Main.tileMergeDirt[this.Type] = true;
    }

    KillSound(i, j, type, fail) {
        if (type === this.Type) {
            const playSound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(int type, int x, int y, int Style, float volumeScale, float pitchOffset)'];
            playSound(this.HitSound, i * 16, j * 16, 1, 1.0, 0.0);
            
            return false;
        }
        return true;
    }

    static InjectTexture() {
        const AncientMythrilBrickTile = Terraria.ID.TileID.AncientMythrilBrick;
        const AncientMythrilBrickItem = Terraria.ID.ItemID.AncientMythrilBrick;

        const scarletTileTexture = tl.texture.load("Textures/TextureReplace/AncientMythrilBrick/ScarletBlock_Tile.png");
        const scarletItemTexture = tl.texture.load("Textures/TextureReplace/AncientMythrilBrick/ScarletBlock_Item.png");

        if (scarletTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[AncientMythrilBrickTile].Value = scarletTileTexture;
        }

        if (scarletItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[AncientMythrilBrickItem].Value = scarletItemTexture;
        }
    }
}