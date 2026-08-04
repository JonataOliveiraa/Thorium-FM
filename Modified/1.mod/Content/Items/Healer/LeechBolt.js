import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class LeechBolt extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(12, 0.25, 0);
        this.Item.mana = 6;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 16, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item8;
        this.Item.shoot = ModProjectile.getTypeByName('LeechBoltPro');
        this.Item.shootSpeed = 8;
    }
}
