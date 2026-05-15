import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ModLocalization } from "../../../TL/ModLocalization.js";
import { Color } from "../../../TL/Modules/Color.js";

export class LifeQuartzTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    static Type = Terraria.ID.TileID.TeamBlockRed;

    IsTileSpelunkable(i, j, type) {
        if (type === LifeQuartzTile.Type) {
            return true;
        }
        return null;
    }

    SetStaticDefaults() {
        const translatedName = ModLocalization.Translate('ItemName.LifeQuartzOre');
        const localizedText = Terraria.Localization.LocalizedText.new();
        localizedText['void .ctor(string key, string text)']('LifeQuartzOre', translatedName);

        Terraria.Lang._mapLegendCache[
            Terraria.Map.MapHelper.TileToLookup(LifeQuartzTile.Type, 0)
        ] = localizedText;

        const idx1 = Terraria.Map.MapHelper.tileLookup[LifeQuartzTile.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(255, 35, 108);

        Terraria.Main.tileSpelunker[LifeQuartzTile.Type] = true;
        Terraria.Main.tileOreFinderPriority[LifeQuartzTile.Type] = 300;
        Terraria.Main.tileShine[LifeQuartzTile.Type] = 300;
        Terraria.Main.tileMergeDirt[LifeQuartzTile.Type] = true;
        Terraria.ID.TileID.Sets.Ore[LifeQuartzTile.Type] = true;
    }

    KillSound(i, j, type, fail) {
        if (type === LifeQuartzTile.Type) {
            const playSound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(int type, int x, int y, int Style, float volumeScale, float pitchOffset)'];
            playSound(this.HitSound, i * 16, j * 16, 1, 1.0, 0.0);
            
            return false;
        }
        return null;
    }

    static InjectTexture() {
        const TeamBlockRedTile = Terraria.ID.TileID.TeamBlockRed;
        const TeamBlockRedItem = Terraria.ID.ItemID.TeamBlockRed;

        const lifeQuartzTileTexture = tl.texture.load("Textures/TextureReplace/TeamBlockRed/LifeQuartz_Tile.png");
        const lifeQuartzItemTexture = tl.texture.load("Textures/TextureReplace/TeamBlockRed/LifeQuartz_Item.png");

        if (lifeQuartzTileTexture != null) {
            Terraria.Main.tileMergeDirt[TeamBlockRedTile] = true
            Terraria.GameContent.TextureAssets.Tile[TeamBlockRedTile].Value = lifeQuartzTileTexture;
        }

        if (lifeQuartzItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[TeamBlockRedItem].Value = lifeQuartzItemTexture;
        }
    }
}