import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class MossyGoldOreTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    static Type = Terraria.ID.TileID.AncientPinkBrick;

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[MossyGoldOreTile.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(224, 224, 63);

        Terraria.Main.tileSpelunker[MossyGoldOreTile.Type] = true;
        Terraria.Main.tileOreFinderPriority[MossyGoldOreTile.Type] = 400;
        Terraria.Main.tileShine[MossyGoldOreTile.Type] = 400;
        Terraria.Main.tileMergeDirt[MossyGoldOreTile.Type] = true;
        Terraria.ID.TileID.Sets.Ore[MossyGoldOreTile.Type] = true;
    }

    KillSound(i, j, type, fail) {
        if (type === MossyGoldOreTile.Type) {
            const playSound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(int type, int x, int y, int Style, float volumeScale, float pitchOffset)'];
            playSound(this.HitSound, i * 16, j * 16, 1, 1.0, 0.0);
            
            return false;
        }
        return true;
    }

    CanKillTile(i, j, type, blockDamaged) {
        if(type === MossyGoldOreTile.Type) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            if(!(player.HeldItem.pick >= 0)) return false
        }
        return null
    }

    static InjectTexture() {
        const AncientPinkBrickTile = Terraria.ID.TileID.AncientPinkBrick;
        const AncientPinkBrickItem = Terraria.ID.ItemID.AncientPinkDungeonBrick;

        const mossyGoldTileTexture = tl.texture.load("Textures/TextureReplace/AncientPinkBrick/MossyGoldOre_Tile.png");
        const mossyGoldItemTexture = tl.texture.load("Textures/TextureReplace/AncientPinkBrick/MossyGoldOre_Item.png");

        if (mossyGoldTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[AncientPinkBrickTile].Value = mossyGoldTileTexture;
        }

        if (mossyGoldItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[AncientPinkBrickItem].Value = mossyGoldItemTexture;
        }
    }
}