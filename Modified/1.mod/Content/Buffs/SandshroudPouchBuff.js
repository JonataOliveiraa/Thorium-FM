import { Terraria } from './../../TL/ModImports.js';
import { ModBuff } from './../../TL/ModBuff.js';

export class SandshroudPouchBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoSave[this.Type] = true;
        Terraria.Main.buffNoTimeDisplay[this.Type] = true;
    }
}

export class SandshroudPouchDebuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoSave[this.Type] = true;
        Terraria.Main.buffNoTimeDisplay[this.Type] = true;
        Terraria.Main.debuff[this.Type] = true;
    }
}