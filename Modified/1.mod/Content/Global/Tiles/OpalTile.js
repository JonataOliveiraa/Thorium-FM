import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class OpalTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    Type = Terraria.ID.TileID.AncientGoldBrick;

    IsTileSpelunkable(i, j, type) {
        if (type === this.Type) {
            return true;
        }
        return null;
    }

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        // Cor Ciano/Verde-Água (Opal) para o mapa
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(330, 31, 100); 
        
        Terraria.Main.tileSpelunker[this.Type] = true;
        Terraria.Main.tileOreFinderPriority[this.Type] = 420;
        Terraria.Main.tileShine[this.Type] = 900;
        Terraria.Main.tileMergeDirt[this.Type] = true;
        Terraria.ID.TileID.Sets.Ore[this.Type] = true;
    }

    CanKillTile(i, j, type, blockDamaged) {
        if(type === this.Type) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            if(!(player.HeldItem.pick >= 0)) return false
        }
        return true
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
        const AncientGoldBrickTile = Terraria.ID.TileID.AncientGoldBrick;
        const AncientGoldBrickItem = Terraria.ID.ItemID.AncientGoldBrick;

        const opalTileTexture = tl.texture.load("Textures/TextureReplace/AncientGoldBrick/Opal_Tile.png");
        const opalItemTexture = tl.texture.load("Textures/TextureReplace/AncientGoldBrick/Opal_Item.png");

        if (opalTileTexture != null) {
            Terraria.Main.tileMergeDirt[AncientGoldBrickTile] = true;
            Terraria.GameContent.TextureAssets.Tile[AncientGoldBrickTile].Value = opalTileTexture;
        }

        if (opalItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[AncientGoldBrickItem].Value = opalItemTexture;
        }
    }
}