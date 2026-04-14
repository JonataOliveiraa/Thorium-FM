import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class LifeQuartzTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    Type = Terraria.ID.TileID.TeamBlockRed;

    IsTileSpelunkable(i, j, type) {
        if (type === this.Type) {
            return true;
        }
        return null;
    }

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(255, 35, 108);
        
        Terraria.Main.tileSpelunker[this.Type] = true;
        Terraria.Main.tileOreFinderPriority[this.Type] = 410;
        Terraria.Main.tileShine[this.Type] = 900;
        Terraria.Main.tileMergeDirt[this.Type] = true;
        Terraria.ID.TileID.Sets.Ore[this.Type] = true;
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
        const TeamBlockRedTile = Terraria.ID.TileID.TeamBlockRed;
        const TeamBlockRedItem = Terraria.ID.ItemID.TeamBlockRed;

        const lifeQuartzTileTexture = tl.texture.load("Textures/TextureReplace/TeamBlockRed/LifeQuartz_Tile.png");
        const lifeQuartzItemTexture = tl.texture.load("Textures/TextureReplace/TeamBlockRed/LifeQuartz_Item.png");

        if (lifeQuartzTileTexture != null) {
            Terraria.Main.tileMergeDirt[TeamBlockRedTile] = true
            Terraria.GameContent.TextureAssets.Tile[TeamBlockRedTile].Value = lifeQuartzTileTexture;
        }

        if (lifeQuartzItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[TeamBlockRedItem].Value = lifeQuartzItemTexture;
        }
    }
}