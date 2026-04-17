import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class WebGun extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Ranged/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(16, 4, 4);
        this.SetDefaultWeaponStyle(26, true);
        this.Item.ranged = true;
        this.Item.shoot = ModProjectile.getTypeByName('WebGunPro1');
        this.Item.shootSpeed = 10;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item108;
    }
        HoldoutOffset(item, player) {
        return { X: -4, Y: 0 };
    }
}
