import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class BatWing extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Viscount/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.Yoyo[this.Type] = true;
        Terraria.ID.ItemID.Sets.GamepadExtraRange[this.Type] = 15;
    }

    SetDefaults() {
        this.Item.melee = true;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.channel = true;

        this.Item.shoot = ModProjectile.getTypeByName('BatWingPro');
        this.Item.shootSpeed = 16;

        this.SetWeaponValues(25, 4, 0);
        this.SetDefaultWeaponStyle(25, true);

        this.Item.width = 24;
        this.Item.height = 24;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }
}
