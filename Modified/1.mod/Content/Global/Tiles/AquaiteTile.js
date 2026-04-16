import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class AquaiteTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    Type = Terraria.ID.TileID.AstraBrick;

    IsTileSpelunkable(i, j, type) {
        if (type === this.Type) {
            return true;
        }
        return null;
    }

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        // Cor azul vibrante (Água) para o mapa
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(0, 191, 255); 
        
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
        const AstraBrickTile = Terraria.ID.TileID.AstraBrick;
        const AstraBrickItem = Terraria.ID.ItemID.AstraBrick;

        const aquaiteTileTexture = tl.texture.load("Textures/TextureReplace/AstraBrick/Aquaite_Tile.png");
        const aquaiteItemTexture = tl.texture.load("Textures/TextureReplace/AstraBrick/Aquaite_Item.png");

        if (aquaiteTileTexture != null) {
            Terraria.Main.tileMergeDirt[AstraBrickTile] = true;
            Terraria.GameContent.TextureAssets.Tile[AstraBrickTile].Value = aquaiteTileTexture;
        }

        if (aquaiteItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[AstraBrickItem].Value = aquaiteItemTexture;
        }
    }
}