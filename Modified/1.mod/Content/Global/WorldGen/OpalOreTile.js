import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';

const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(int type, int x, int y, int Style, float volumeScale, float pitchOffset)'];

export class OpalOreTile extends GlobalTile {
    IsTileSpelunkable(i, j, type) {
        if (type === Terraria.ID.TileID.TeamBlockRed) {
            return true;
        }
        return null;
    }

    KillSound(i, j, type, fail) {
        if (type === Terraria.ID.TileID.TeamBlockRed) {
            PlaySound(21, i * 16, j * 16, 1, 1.0, 0.0);
            return false;
        }
        return true;
    }
}