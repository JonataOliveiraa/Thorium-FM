import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class LeakyMarineBlock extends GlobalTile {
    Type = Terraria.ID.TileID.EasterBlock;
    HitSound = Terraria.ID.SoundID.Tink;
    
    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(104, 138, 165);
        
        Terraria.Main.tileMergeDirt[this.Type] = true;
    }

    CanKillTile(i, j, type, blockDamaged) {
        if(type === this.Type) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            if(!(player.HeldItem.pick >= 65)) return false
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
        const EasterBlockTile = Terraria.ID.TileID.EasterBlock;
        const EasterBlockItem = Terraria.ID.ItemID.EasterBlock;

        const leakyMarineItemTexture = tl.texture.load("Textures/TextureReplace/EasterBlock/LeakyMarineBlock_Item.png");
        const leakyMarineTileTexture = tl.texture.load("Textures/TextureReplace/EasterBlock/LeakyMarineBlock_Tile.png");

        if (leakyMarineTileTexture != null) {
            Terraria.Main.tileMergeDirt[EasterBlockTile] = true
            Terraria.GameContent.TextureAssets.Tile[EasterBlockTile].Value = leakyMarineTileTexture;
        }

        if (leakyMarineItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[EasterBlockItem].Value = leakyMarineItemTexture;
        }
    }
}