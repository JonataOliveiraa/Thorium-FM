import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class AquamarineTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    Type = Terraria.ID.TileID.CryocoreBrick;

    IsTileSpelunkable(i, j, type) {
        if (type === this.Type) {
            return true;
        }
        return null;
    }

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        // Cor Ciano/Verde-Água (Aquamarine) para o mapa
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(127, 255, 212); 
        
        Terraria.Main.tileSpelunker[this.Type] = true;
        Terraria.Main.tileOreFinderPriority[this.Type] = 420;
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
        const CryocoreBrickTile = Terraria.ID.TileID.CryocoreBrick;
        const CryocoreBrickItem = Terraria.ID.ItemID.CryocoreBrick;

        const aquamarineTileTexture = tl.texture.load("Textures/TextureReplace/CryocoreBrick/Aquamarine_Tile.png");
        const aquamarineItemTexture = tl.texture.load("Textures/TextureReplace/CryocoreBrick/Aquamarine_Item.png");

        if (aquamarineTileTexture != null) {
            Terraria.Main.tileMergeDirt[CryocoreBrickTile] = true;
            Terraria.GameContent.TextureAssets.Tile[CryocoreBrickTile].Value = aquamarineTileTexture;
        }

        if (aquamarineItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[CryocoreBrickItem].Value = aquamarineItemTexture;
        }
    }
}