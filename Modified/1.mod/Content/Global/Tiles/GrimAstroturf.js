import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class GrimAstroturf extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Dig;
    Type = Terraria.ID.TileID.AncientCopperBrick;

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(96, 70, 53);

        Terraria.Main.tileMergeDirt[this.Type] = true;
        Terraria.Main.tileShine[this.Type] = 0;
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
        return null
    }

    static InjectTexture() {
        const AncientCopperBrickTile = Terraria.ID.TileID.AncientCopperBrick;
        const AncientCopperBrickItem = Terraria.ID.ItemID.AncientCopperBrick;
        
        const GrimAstroturfTileTexture = tl.texture.load("Textures/TextureReplace/AncientCopperBrick/GrimAstroturf_Tile.png");
        const GrimAstroturfItemTexture = tl.texture.load("Textures/TextureReplace/AncientCopperBrick/GrimAstroturf_Item.png");
        
        if (GrimAstroturfTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[AncientCopperBrickTile].Value = GrimAstroturfTileTexture;
        }

        if (GrimAstroturfItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[AncientCopperBrickItem].Value = GrimAstroturfItemTexture;
        }
    }
}