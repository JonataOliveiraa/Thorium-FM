import { ModBuff } from '../../TL/ModBuff.js';

const DEFENSE = 5;
const LIFE_REGEN = 2;
const LIFE_REGEN_TIME = 4;

export class BloomBoostBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/BloomBoost';
    }

    UpdatePlayer(player, buffIndex) {
        player.statDefense += DEFENSE;
        player.lifeRegen += LIFE_REGEN;
        player.lifeRegenTime += LIFE_REGEN_TIME;
    }
}
