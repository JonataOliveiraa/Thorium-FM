import { Terraria } from './../../TL/ModImports.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ThoriumPlayer } from './../Global/ThoriumPlayer.js';

const DAMAGE_BONUS = 0.1;

export class AquaticAptitude extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoSave[this.Type] = true;
        Terraria.Main.buffNoTimeDisplay[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        player.meleeDamage += DAMAGE_BONUS;
        player.magicDamage += DAMAGE_BONUS;
        player.rangedDamage += DAMAGE_BONUS;
        player.minionDamage += DAMAGE_BONUS;
        ThoriumPlayer.class.Bard.multiplier += DAMAGE_BONUS;
        ThoriumPlayer.class.Healer.multiplier += DAMAGE_BONUS;
    }
}
