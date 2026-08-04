import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';

const { Main } = Terraria;

export class PearlPikeBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.buffNoSave[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        player.moveSpeed += 0.1;
        player.runAcceleration += 0.08;
        player.jumpSpeedBoost += 0.3;
    }
}
