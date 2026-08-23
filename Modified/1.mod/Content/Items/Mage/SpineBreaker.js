import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class SpineBreaker extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 40;
        this.Item.magic = true;
        this.Item.damage = 18;
        this.Item.mana = 15;
        this.Item.useTime = 46;
        this.Item.useAnimation = 46;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 1.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = 3;
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
        this.Item.autoReuse = true;
        this.Item.shoot = ModProjectile.getTypeByName('SpineBreaker1');
        this.Item.shootSpeed = 8.0;
    }
}