import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModMount } from '../../../TL/ModMount.js';

export class MagmaCharmBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/Mounts/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.buffNoTimeDisplay[this.Type] = true; // The time remaining won't display on this buff
        Terraria.Main.buffNoSave[this.Type] = true; // This buff won't save when you exit the world
    }
    
    UpdatePlayer(player, buffIndex) {
        player.mount.SetMount(ModMount.getTypeByName('MagmaCharm'), player, false);
        player.buffTime[buffIndex] = 10; // reset buff time
    }
}