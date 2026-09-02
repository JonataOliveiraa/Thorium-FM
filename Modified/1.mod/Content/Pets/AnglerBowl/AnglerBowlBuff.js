import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const PET_TIME = 18000;

export class AnglerBowlBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.petType = 0;
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoTimeDisplay[this.Type] = true;
        Terraria.Main.lightPet[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        if (!this.petType) this.petType = ModProjectile.getTypeByName('AnglerBowlPro');
        player.BuffHandle_SpawnPetIfNeededAndSetTime(buffIndex, true, this.petType, PET_TIME);
    }
}
