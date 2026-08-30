import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Main } = Terraria;

export class LittlePhylacteryBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
        this._petType = -1;
    }

    SetStaticDefaults() {
        Main.buffNoTimeDisplay[this.Type] = true;
        Main.vanityPet[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        if (this._petType === -1) this._petType = ModProjectile.getTypeByName('LittleNecromancer') ?? -2;
        if (this._petType <= 0) return;

        player.BuffHandle_SpawnPetIfNeededAndSetTime(buffIndex, true, this._petType, 18000);
    }
}
