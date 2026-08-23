import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class Trapper extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Ranged/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 20;
        this.Item.ranged = true;
        this.Item.damage = 15;
        this.Item.useTime = 24;
        this.Item.useAnimation = 24;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 3.0;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = 1;
        this.Item.UseSound = Terraria.ID.SoundID.Item63;
        this.Item.autoReuse = true;
        this.Item.shoot = 98;
        this.Item.shootSpeed = 10.0;
        this.Item.useAmmo = Terraria.ID.AmmoID.Dart;
    }
}
