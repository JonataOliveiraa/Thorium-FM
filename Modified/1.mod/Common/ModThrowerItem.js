import { ThoriumPlayer } from "../Content/Global/ThoriumPlayer.js";
import { ModItem } from "../TL/ModItem.js";

export class ModThrowerItem extends ModItem {
    static throwerItemsName = new Set()

    constructor() {
        super()
    }

    ModifyWeaponDamage(item, player, damage) {
        const cls = ThoriumPlayer.class.Thrower;
        return damage * cls.multiplier + cls.throwingDamage;
    }
}