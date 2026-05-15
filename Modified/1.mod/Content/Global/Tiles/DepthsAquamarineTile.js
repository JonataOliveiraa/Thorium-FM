import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ModLocalization } from "../../../TL/ModLocalization.js";
import { Color } from "../../../TL/Modules/Color.js";

export class DepthsAquamarineTile extends GlobalTile {
    HitSound = Terraria.ID.SoundID.Tink;
    static Type = Terraria.ID.TileID.TeamBlockPink;

    IsTileSpelunkable(i, j, type) {
        if (type === DepthsAquamarineTile.Type) {
            return true;
        }
        return null;
    }

    SetStaticDefaults() {
        const translatedName = ModLocalization.Translate('ItemName.AquamarineGem');
        const localizedText = Terraria.Localization.LocalizedText.new();
        localizedText['void .ctor(string key, string text)']('AquamarineGem', translatedName);

        Terraria.Lang._mapLegendCache[
            Terraria.Map.MapHelper.TileToLookup(DepthsAquamarineTile.Type, 0)
        ] = localizedText;

        const idx1 = Terraria.Map.MapHelper.tileLookup[DepthsAquamarineTile.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(127, 255, 240); 
            
        Terraria.Main.tileSpelunker[DepthsAquamarineTile.Type] = true;
        Terraria.Main.tileOreFinderPriority[DepthsAquamarineTile.Type] = 420;
        Terraria.Main.tileShine[DepthsAquamarineTile.Type] = 900;
        Terraria.Main.tileMergeDirt[DepthsAquamarineTile.Type] = true;
        Terraria.ID.TileID.Sets.Ore[DepthsAquamarineTile.Type] = true;
    }

    CanKillTile(i, j, type, blockDamaged) {
        if(type === DepthsAquamarineTile.Type) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            if(!(player.HeldItem.pick >= 0)) return false
        }
        return null
    }

    KillSound(i, j, type, fail) {
        if (type === DepthsAquamarineTile.Type) {
            const playSound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(int type, int x, int y, int Style, float volumeScale, float pitchOffset)'];
            playSound(this.HitSound, i * 16, j * 16, 1, 1.0, 0.0);
            
            return false;
        }
        return true;
    }

    static InjectTexture() {
        const TeamBlockPinkTile = Terraria.ID.TileID.TeamBlockPink;

        const DepthsAquamarineTileTexture = tl.texture.load("Textures/TextureReplace/TeamBlockPink/DepthsAquamarine_Tile.png");

        if (DepthsAquamarineTileTexture != null) {
            Terraria.Main.tileMergeDirt[TeamBlockPinkTile] = true;
            Terraria.GameContent.TextureAssets.Tile[TeamBlockPinkTile].Value = DepthsAquamarineTileTexture;
        }
    }
}