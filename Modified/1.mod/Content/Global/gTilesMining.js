import { GlobalTile } from '../../TL/GlobalTile.js';
import { Terraria } from '../../TL/ModImports.js';
import { ThoriumPlayer } from './ThoriumPlayer.js';

const { Main } = Terraria;

const HEAL_PERCENT = 0.01;
const HEAL_EFFECT = 'void HealEffect(int healAmount, bool broadcast)';

export class gTilesMining extends GlobalTile {
    constructor() {
        super();
    }

    DropItems(i, j, tile) {
        if (!ThoriumPlayer.itemVampirePickaxe) return;
        if (!tile || !Terraria.ID.TileID.Sets.Ore[tile.type]) return;

        const player = Main.player[Main.myPlayer];
        if (!player || !player.active || player.dead) return;
        if (player.statLife >= player.statLifeMax2) return;

        const heal = Math.max(1, Math.floor(player.statLifeMax2 * HEAL_PERCENT));

        player.statLife = Math.min(player.statLifeMax2, player.statLife + heal);
        player[HEAL_EFFECT](heal, false);
    }
}
