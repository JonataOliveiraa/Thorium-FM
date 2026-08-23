import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class StreamSting extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Ranged/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.damage = 14;
        this.Item.ranged = true;
        this.Item.width = 42;
        this.Item.height = 30;
        this.Item.useTime = 16;
        this.Item.useAnimation = 16;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 2.0;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 75, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item5;
        this.Item.autoReuse = true;
        this.Item.shoot = 1;
        this.Item.shootSpeed = 8.0;
        this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;
    }
}
