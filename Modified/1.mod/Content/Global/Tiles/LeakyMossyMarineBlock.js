import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class LeakyMossyMarineBlock extends GlobalTile {
    static Type = Terraria.ID.TileID.TeamBlockYellow;
    HitSound = Terraria.ID.SoundID.Tink;
    
    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[LeakyMossyMarineBlock.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(105, 160, 165);
        
        Terraria.Main.tileMergeDirt[LeakyMossyMarineBlock.Type] = true;
    }

    KillSound(i, j, type, fail) {
        if (type === LeakyMossyMarineBlock.Type) {
            const playSound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(int type, int x, int y, int Style, float volumeScale, float pitchOffset)'];
            playSound(this.HitSound, i * 16, j * 16, 1, 1.0, 0.0);
            
            return false;
        }
        return true;
    }

    CanKillTile(i, j, type, blockDamaged) {
        if(type === LeakyMossyMarineBlock.Type) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            if(!(player.HeldItem.pick >= 65)) return false
        }
        return null
    }

    static InjectTexture() {
        const TeamBlockYellowTile = Terraria.ID.TileID.TeamBlockYellow;
        const TeamBlockYellowItem = Terraria.ID.ItemID.TeamBlockYellow;

        const leakyMossyMarineItemTexture = tl.texture.load("Textures/TextureReplace/TeamBlockYellow/LeakyMossyMarineBlock_Item.png");
        const leakyMossyMarineTileTexture = tl.texture.load("Textures/TextureReplace/TeamBlockYellow/LeakyMossyMarineBlock_Tile.png");

        if (leakyMossyMarineTileTexture != null) {
            Terraria.Main.tileMergeDirt[TeamBlockYellowTile] = true
            Terraria.GameContent.TextureAssets.Tile[TeamBlockYellowTile].Value = leakyMossyMarineTileTexture;
        }

        if (leakyMossyMarineItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[TeamBlockYellowItem].Value = leakyMossyMarineItemTexture;
        }
    }
}