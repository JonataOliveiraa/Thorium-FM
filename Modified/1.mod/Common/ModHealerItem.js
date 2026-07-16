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

        this.isScytheSoul = false;
        this.soulEssenceStack = 0
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

    SetDefaultsToScythe() {
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.autoReuse = true;
        this.Item.useTime = 22;
        this.Item.useAnimation = 22;
        this.Item.maxStack = 1;
        this.Item.knockBack = 6.5;
        this.Item.useStyle = 1;
        this.Item.UseSound =  Terraria.ID.SoundID.Item1;
        this.Item.shootSpeed = 0.1;
    }

    HoldItem(item) {
        if(this.isScytheSoul) {
            ThoriumPlayer.soulEssenceActive = true;
        }
    }
}