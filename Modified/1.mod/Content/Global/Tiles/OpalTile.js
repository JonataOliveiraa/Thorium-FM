import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ModLocalization } from "../../../TL/ModLocalization.js";
import { Color } from "../../../TL/Modules/Color.js";

export class OpalTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    static Type = Terraria.ID.TileID.AncientGoldBrick;

    IsTileSpelunkable(i, j, type) {
        if (type === OpalTile.Type) {
            return true;
        }
        return null;
    }

    SetStaticDefaults() {
        const translatedName = ModLocalization.Translate('ItemName.OpalGem');
        const localizedText = Terraria.Localization.LocalizedText.new();
        localizedText['void .ctor(string key, string text)']('OpalOre', translatedName);

        Terraria.Lang._mapLegendCache[
            Terraria.Map.MapHelper.TileToLookup(OpalTile.Type, 0)
        ] = localizedText;

        const idx1 = Terraria.Map.MapHelper.tileLookup[OpalTile.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(342, 55, 100); 

        Terraria.Main.tileSpelunker[OpalTile.Type] = true;
        Terraria.Main.tileOreFinderPriority[OpalTile.Type] = 570;
        Terraria.Main.tileShine[OpalTile.Type] = 900;
        Terraria.Main.tileMergeDirt[OpalTile.Type] = true;
        Terraria.ID.TileID.Sets.Ore[OpalTile.Type] = true;
    }

    CanKillTile(i, j, type, blockDamaged) {
        if(type === OpalTile.Type) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            if(!(player.HeldItem.pick >= 0)) return false
        }
        return null
    }

    KillSound(i, j, type, fail) {
        if (type === OpalTile.Type) {
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