import { Terraria } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ThoriumPlayer } from './../../Global/ThoriumPlayer.js';

const ENDURANCE = 0.1;
const HEAL_INTERVAL = 60;
const COOLDOWN_TIME = 900;

let _debuffType = -1;

export class LifeQuartzShieldBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
        this._healTimer = 0;
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoSave[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        ThoriumPlayer.accLifeQuartzShieldVisual = true;
        player.endurance += ENDURANCE;

        this._healTimer++;
        if (this._healTimer >= HEAL_INTERVAL) {
            this._healTimer = 0;
            const bonus = ThoriumPlayer.class.Healer.getHealValue();
            if (bonus > 0) player.Heal(Math.max(1, Math.floor(bonus)));
        }

        if (player.buffTime[buffIndex] !== 4) return;

        if (_debuffType === -1) _debuffType = ModBuff.getTypeByName('LifeQuartzShieldDebuff') ?? -2;
        if (_debuffType < 0) return;

        player.AddBuff(_debuffType, COOLDOWN_TIME, true);
    }
}
