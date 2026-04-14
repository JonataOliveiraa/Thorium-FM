import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class ThoriumOreTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    Type = Terraria.ID.TileID.TeamBlockBlue;

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(172, 96, 70);

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
        //Thorium Ore
        const TeamBlockBlueTile = Terraria.ID.TileID.TeamBlockBlue;
        const TeamBlockBlueItem = Terraria.ID.ItemID.TeamBlockBlue;

        const thoriumTileTexture = tl.texture.load("Textures/TextureReplace/TeamBlockBlue/ThoriumOre_Tile.png");
        const thoriumItemTexture = tl.texture.load("Textures/TextureReplace/TeamBlockBlue/ThoriumOre_Item.png");

        if (thoriumTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[TeamBlockBlueTile].Value = thoriumTileTexture;
        }

        if (thoriumItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[TeamBlockBlueItem].Value = thoriumItemTexture;
        }
    }
}