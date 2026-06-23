// ModBardItem.js
import { ThoriumPlayer } from "../Content/Global/ThoriumPlayer.js";
import { ModItem } from "../TL/ModItem.js";
import { PrefixUtils } from "../TL/Modules/Utils/Prefix.js";
import { PlayerDB } from "../TL/PlayerDB.js";
import { Rand } from "../TL/Modules/Rand.js";

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
        this.RollablePrefixes = [...PrefixUtils.MagicPrefixes];
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
            ThoriumPlayer.resLastInspirationSpent = this.inspirationCost;

            if (Rand.NextFloat() < cls.inspirationConsume) {
                const current = PlayerDB.get("Inspiration") ?? 0;
                PlayerDB.set("Inspiration", Math.max(0, current - this.inspirationCost));
                ThoriumPlayer.resLastInspirationSpent = this.inspirationCost;
            }
        }
        
        return true;
    }
}