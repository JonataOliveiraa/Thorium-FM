import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';

const AGGRO_REDUCTION = 500;
const STEALTH_VALUE = 0.5;
const STEALTH_TIMER = 10;

export class MidnightOilBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoSave[this.Type] = false;
        Terraria.Main.buffNoTimeDisplay[this.Type] = false;
    }

    UpdatePlayer(player, buffIndex) {
        player.aggro -= AGGRO_REDUCTION;

        if (player.setVortex) return;

        player.shroomiteStealth = true;
        player.stealth = STEALTH_VALUE;
        player.stealthTimer = STEALTH_TIMER;
    }
}
