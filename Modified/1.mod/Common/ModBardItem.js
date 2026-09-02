// ModBardItem.js
import { ThoriumPlayer } from "../Content/Global/ThoriumPlayer.js";
import { ModItem } from "../TL/ModItem.js";
import { PlayerDB } from "../TL/PlayerDB.js";
import { Rand } from "../TL/Modules/Rand.js";
import { ModPrefix } from "../TL/ModPrefix.js";

export class ModBardItem extends ModItem {
    static bardItemsName = new Set();

    useWheel = true;
    inspirationCost = 1;
    inspirationMax = 20;
    useTimer = false;
    instrumentStyle = null; // Brass, Percussion, String, Wind , Electronic 
    timerStyle = null;        // 'Brass', 'String', etc.

    constructor() {
        super();
    }

    MeleePrefix(item) {
        return false;
    }

    RangedPrefix(item) {
        return false;
    }

    MagicPrefix(item) {
        return false;
    }

    SummonPrefix(item) {
        return false;
    }

    WeaponPrefix(item) {
        return false;
    }

    HoldItem(item, player) {
        if (!ModPrefix.isModType(item.prefix)) return;

        const prefix = ModPrefix.getModPrefix(item.prefix);
        if (!prefix || typeof prefix.EmpowermentTicks !== 'number') return;

        ThoriumPlayer.class.Bard.bardBuffDurationFlat += prefix.EmpowermentTicks;
    }

    ModifyWeaponDamage(item, player, damage) {
        const cls = ThoriumPlayer.class.Bard;
        return cls.symphonicDamage + damage * cls.multiplier;
    }

    PostSetupContent() {
        ModBardItem.bardItemsName.add(this.Type);
    }

    CanUseItem(item, player) {
        if (!this.useWheel) return true;
        return (PlayerDB.get("Inspiration") ?? 0) >= this.inspirationCost;
    }

    UseItem(item, player) {
        if (this.useWheel && player.itemAnimation === player.itemAnimationMax) {
            const cls = ThoriumPlayer.class.Bard;

            if (Rand.NextFloat() < cls.inspirationConsume) {
                const current = PlayerDB.get("Inspiration") ?? 0;
                PlayerDB.set("Inspiration", Math.max(0, current - this.inspirationCost));
                ThoriumPlayer.RegisterResourceSpent(0, this.inspirationCost);
            }
        }
        
        return true;
    }
}