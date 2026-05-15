import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ModLocalization } from "../../../TL/ModLocalization.js";
import { Color } from "../../../TL/Modules/Color.js";

export class ThoriumOreTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    static Type = Terraria.ID.TileID.TeamBlockBlue;

    SetStaticDefaults() {
        const translatedName = ModLocalization.Translate('ItemName.ThoriumOre');
        const localizedText = Terraria.Localization.LocalizedText.new();
        localizedText['void .ctor(string key, string text)']('ThoriumOre', translatedName);

        Terraria.Lang._mapLegendCache[
            Terraria.Map.MapHelper.TileToLookup(ThoriumOreTile.Type, 0)
        ] = localizedText;

        const idx1 = Terraria.Map.MapHelper.tileLookup[ThoriumOreTile.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(82, 222, 244);

        Terraria.Main.tileShine[ThoriumOreTile.Type] = 400;
        Terraria.Main.tileSpelunker[ThoriumOreTile.Type] = true;
        Terraria.Main.tileOreFinderPriority[ThoriumOreTile.Type] = 500;
        Terraria.Main.tileMergeDirt[ThoriumOreTile.Type] = true;
        Terraria.ID.TileID.Sets.Ore[ThoriumOreTile.Type] = true;
    }

    KillSound(i, j, type, fail) {
        if (type === ThoriumOreTile.Type) {
            const playSound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(int type, int x, int y, int Style, float volumeScale, float pitchOffset)'];
            playSound(this.HitSound, i * 16, j * 16, 1, 1.0, 0.0);

            return false;
        }
        return true;
    }

    CanKillTile(i, j, type, blockDamaged) {
        if (type === ThoriumOreTile.Type) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            if (!(player.HeldItem.pick >= 40)) return false
        }
        return null
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