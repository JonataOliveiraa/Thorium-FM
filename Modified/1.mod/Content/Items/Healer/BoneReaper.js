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
        this.scytheSoulCharge = 1;
        this.soulEssenceStack = 1;

        this.Item.damage = 12;
        
        this.Item.width = 48;   
        this.Item.height = 38;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 75, 0);
        this.Item.rare = 2;
        this.Item.shoot = ModProjectile.getTypeByName('BoneReaperPro');
    }
}