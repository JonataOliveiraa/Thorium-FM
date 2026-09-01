import { Terraria } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class StormCloudBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.petType = 0;
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoTimeDisplay[this.Type] = true;
        Terraria.Main.vanityPet[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        if (!this.petType) this.petType = ModProjectile.getTypeByName('StormCloudPro');
        player.BuffHandle_SpawnPetIfNeededAndSetTime(buffIndex, true, this.petType, 18000);
    }
}
