import { Terraria } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ThoriumPlayer } from './../../Global/ThoriumPlayer.js';

export class LifeQuartzShieldDebuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.debuff[this.Type] = true;
        Terraria.Main.buffNoSave[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        ThoriumPlayer.accLifeQuartzShieldBad = true;
    }
}
