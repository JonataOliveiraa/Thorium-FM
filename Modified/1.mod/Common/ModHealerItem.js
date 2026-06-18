import { ThoriumPlayer } from "../Content/Global/ThoriumPlayer.js";
import { Terraria } from "../TL/ModImports.js";
import { ModItem } from "../TL/ModItem.js";
import { PrefixUtils } from "../TL/Modules/Utils/Prefix.js";

export class ModHealerItem extends ModItem {
    static healerItemsName = new Set()
    static healerItemsByType = new Map();

    constructor() {
        super()
        this.RollablePrefixes = [
            ...PrefixUtils.MagicPrefixes
        ]
    }

    ModifyWeaponDamage(item, player, damage) {
        const cls = ThoriumPlayer.class.Healer;
        item.damage = item.OriginalDamage * cls.multiplier + cls.radiantDamage

        return damage
    }

    PostSetupContent() {
        ModHealerItem.healerItemsName.add(this.Type);
        ModHealerItem.healerItemsByType.set(this.Type, this);
    }
}