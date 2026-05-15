import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ModLocalization } from "../../../TL/ModLocalization.js";
import { Color } from "../../../TL/Modules/Color.js";

export class AquaiteTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    static Type = Terraria.ID.TileID.AncientBlueBrick;

    IsTileSpelunkable(i, j, type) {
        if (type === AquaiteTile.Type) {
            return true;
        }
        return null;
    }

    SetStaticDefaults() {
        const translatedName = ModLocalization.Translate('ItemName.AquaiteOre');
        const localizedText = Terraria.Localization.LocalizedText.new();
        localizedText['void .ctor(string key, string text)']('AquaiteOre', translatedName);

        Terraria.Lang._mapLegendCache[
            Terraria.Map.MapHelper.TileToLookup(AquaiteTile.Type, 0)
        ] = localizedText;

        const idx1 = Terraria.Map.MapHelper.tileLookup[AquaiteTile.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(39, 137, 205);

        Terraria.Main.tileSpelunker[AquaiteTile.Type] = true;
        Terraria.Main.tileOreFinderPriority[AquaiteTile.Type] = 600;
        Terraria.Main.tileShine[AquaiteTile.Type] = 900;
        Terraria.Main.tileMergeDirt[AquaiteTile.Type] = true;
        Terraria.ID.TileID.Sets.Ore[AquaiteTile.Type] = true;
    }

    KillSound(i, j, type, fail) {
        if (type === AquaiteTile.Type) {
            const playSound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(int type, int x, int y, int Style, float volumeScale, float pitchOffset)'];
            playSound(this.HitSound, i * 16, j * 16, 1, 1.0, 0.0);

            return false;
        }
        return true;
    }

    static InjectTexture() {
        const AncientBlueBrickTile = Terraria.ID.TileID.AncientBlueBrick;
        const AncientBlueBrickItem = Terraria.ID.ItemID.AncientBlueDungeonBrick;

        const aquaiteTileTexture = tl.texture.load("Textures/TextureReplace/AncientBlueBrick/Aquaite_Tile.png");
        const aquaiteItemTexture = tl.texture.load("Textures/TextureReplace/AncientBlueBrick/Aquaite_Item.png");

        if (aquaiteTileTexture != null) {
            Terraria.Main.tileMergeDirt[AncientBlueBrickTile] = true;
            Terraria.GameContent.TextureAssets.Tile[AncientBlueBrickTile].Value = aquaiteTileTexture;
        }

        if (aquaiteItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[AncientBlueBrickItem].Value = aquaiteItemTexture;
        }
    }

    CanKillTile(i, j, type, blockDamaged) {
        if (type === AquaiteTile.Type) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            if (!(player.HeldItem.pick >= 65)) return false
        }
        return null
    }
}