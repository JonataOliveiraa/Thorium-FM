import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

export class PrehistoricAmberStaffBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.buffNoSave[this.Type] = true;
        Terraria.Main.buffNoTimeDisplay[this.Type] = true;
    }
    
    PostSetupContent() {
        this.MinionTypes = [
            ModProjectile.getTypeByName('PrehistoricAmberStaffTRexPro'),
            ModProjectile.getTypeByName('PrehistoricAmberStaffPterosPro')
        ];
        
        const handler = Terraria.DataStructures.CachedProjectileCounterBuffTextHandler.new();
        handler.projectilesToLookFor = this.MinionTypes.makeGeneric('int');
        Terraria.ID.BuffID.Sets.BuffTextHandlers.Add(this.Type, handler);
    }
    
    UpdatePlayer(player, buffIndex) {
        let hasMinion = false;
        for (const t of this.MinionTypes) {
            if (player.ownedProjectileCounts[t] > 0) { hasMinion = true; break; }
        }
        if (hasMinion) {
            player.buffTime[buffIndex] = 18000;
        } else {
            player.DelBuff(buffIndex);
        }
    }
}