import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ModLocalization } from "../../../TL/ModLocalization.js";
import { Color } from "../../../TL/Modules/Color.js";

export class SmoothCoal extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    static Type = Terraria.ID.TileID.ReefBlock;

    SetStaticDefaults() {
        const translatedName = ModLocalization.Translate('ItemName.SmoothCoal');
        const localizedText = Terraria.Localization.LocalizedText.new();
        localizedText['void .ctor(string key, string text)']('SmoothCoal', translatedName);

        Terraria.Lang._mapLegendCache[
            Terraria.Map.MapHelper.TileToLookup(SmoothCoal.Type, 0)
        ] = localizedText;

        const idx1 = Terraria.Map.MapHelper.tileLookup[SmoothCoal.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(0, 0, 8);

        Terraria.Main.tileSpelunker[SmoothCoal.Type] = true;
        Terraria.Main.tileOreFinderPriority[SmoothCoal.Type] = 100;
        Terraria.Main.tileMergeDirt[SmoothCoal.Type] = true;
        Terraria.ID.TileID.Sets.Ore[SmoothCoal.Type] = true;
    }

    KillSound(i, j, type, fail) {
        if (type === SmoothCoal.Type) {
            const playSound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(int type, int x, int y, int Style, float volumeScale, float pitchOffset)'];
            playSound(this.HitSound, i * 16, j * 16, 1, 1.0, 0.0);

            return false;
        }
        return true;
    }

    CanKillTile(i, j, type, blockDamaged) {
        if (type === SmoothCoal.Type) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            if (!(player.HeldItem.pick >= 0)) return false
        }
        return null
    }

    static InjectTexture() {
        const ReefBlockTile = Terraria.ID.TileID.ReefBlock;
        const ReefBlockItem = Terraria.ID.ItemID.ReefBlock;

        const smoothCoalTileTexture = tl.texture.load("Textures/TextureReplace/ReefBlock/SmoothCoal_Tile.png");
        const smoothCoalItemTexture = tl.texture.load("Textures/TextureReplace/ReefBlock/SmoothCoal_Item.png");

        if (smoothCoalTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[ReefBlockTile].Value = smoothCoalTileTexture;
        }

        if (smoothCoalItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[ReefBlockItem].Value = smoothCoalItemTexture;
        }
    }
}