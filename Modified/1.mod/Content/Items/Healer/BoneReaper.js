import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";

export class BoneReaper extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetDefaultsToScythe();

        this.isScytheSoul = true;
        this.soulEssenceStack = 1;

        this.SetWeaponValues(12, 6.5, 4);

        this.Item.width = 48;
        this.Item.height = 38;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.shoot = ModProjectile.getTypeByName('BoneReaperPro');
    }
}
