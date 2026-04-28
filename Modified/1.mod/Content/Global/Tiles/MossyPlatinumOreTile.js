import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class MossyPlatinumOreTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    Type = Terraria.ID.TileID.ForbiddenBlock;

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(171, 158, 255);

        Terraria.Main.tileSpelunker[this.Type] = true;
        Terraria.Main.tileOreFinderPriority[this.Type] = 300;
        Terraria.Main.tileShine[this.Type] = 500;
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

    CanKillTile(i, j, type, blockDamaged) {
        if(type === this.Type) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            if(!(player.HeldItem.pick >= 0)) return false
        }
        return true
    }

    static InjectTexture() {
        const ForbiddenBlockTile = Terraria.ID.TileID.ForbiddenBlock;
        const ForbiddenBlockItem = Terraria.ID.ItemID.ForbiddenBlock;

        const mossyPlatinumTileTexture = tl.texture.load("Textures/TextureReplace/ForbiddenBlock/MossyPlatinumOre_Tile.png");
        const mossyPlatinumItemTexture = tl.texture.load("Textures/TextureReplace/ForbiddenBlock/MossyPlatinumOre_Item.png");

        if (mossyPlatinumTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[ForbiddenBlockTile].Value = mossyPlatinumTileTexture;
        }

        if (mossyPlatinumItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[ForbiddenBlockItem].Value = mossyPlatinumItemTexture;
        }
    }
}