import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

export class ViscountCaneBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
        this.MinionType = -1;
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoSave[this.Type] = true;
        Terraria.Main.buffNoTimeDisplay[this.Type] = true;
    }

    PostSetupContent() {
        this.MinionType = ModProjectile.getTypeByName('ViscountCanePro');

        const handler = Terraria.DataStructures.CachedProjectileCounterBuffTextHandler.new();
        handler.projectilesToLookFor = [this.MinionType].makeGeneric('int');
        Terraria.ID.BuffID.Sets.BuffTextHandlers.Add(this.Type, handler);
    }

    UpdatePlayer(player, buffIndex) {
        if (this.MinionType >= 0 && player.ownedProjectileCounts[this.MinionType] > 0) {
            player.buffTime[buffIndex] = 18000;
        } else {
            player.DelBuff(buffIndex);
        }
    }
}
