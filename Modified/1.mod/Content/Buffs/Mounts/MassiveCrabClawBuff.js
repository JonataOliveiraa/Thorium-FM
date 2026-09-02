import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModMount } from '../../../TL/ModMount.js';

const BUFF_REFRESH = 10;

export class MassiveCrabClawBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/Mounts/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoTimeDisplay[this.Type] = true;
        Terraria.Main.buffNoSave[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        player.mount.SetMount(ModMount.getTypeByName('MassiveCrabClawMount'), player, false);
        player.buffTime[buffIndex] = BUFF_REFRESH;
        player.waterWalk = true;
        player.ignoreWater = true;
        player.noFallDmg = true;
    }
}
