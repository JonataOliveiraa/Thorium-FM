import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Main } = Terraria;

export class Staggered extends ModBuff {
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
        player.jump = 0;
        player.rocketTime = 0;
        player.rocketBoots = 0;
        player.wingTime = 0;
        player.jumpSpeedBoost -= 0.3;
        ThoriumPlayer.debuffStaggered = true;
    }
}
