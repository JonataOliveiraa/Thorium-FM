import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';

const { Main } = Terraria;

export class Liquefied extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.debuff[this.Type] = true;
        Main.pvpBuff[this.Type] = true;
        Main.buffNoSave[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        player.moveSpeed -= 0.5;
        player.accRunSpeed = player.maxRunSpeed;
        player.statDefense -= 16;
    }
}
