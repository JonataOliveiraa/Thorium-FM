import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class MossyGoldOreTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    Type = Terraria.ID.TileID.StarRoyaleBrick;

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(224, 224, 63);

        Terraria.Main.tileShine[this.Type] = 900;
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
        const StarRoyaleBrickTile = Terraria.ID.TileID.StarRoyaleBrick;
        const StarRoyaleBrickItem = Terraria.ID.ItemID.StarRoyaleBrick;

        const mossyGoldTileTexture = tl.texture.load("Textures/TextureReplace/StarRoyaleBrick/MossyGoldOre_Tile.png");
        const mossyGoldItemTexture = tl.texture.load("Textures/TextureReplace/StarRoyaleBrick/MossyGoldOre_Item.png");

        if (mossyGoldTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[StarRoyaleBrickTile].Value = mossyGoldTileTexture;
        }

        if (mossyGoldItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[StarRoyaleBrickItem].Value = mossyGoldItemTexture;
        }
    }
}