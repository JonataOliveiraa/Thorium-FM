import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class HighTide extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 20;
        this.Item.magic = true;
        this.Item.damage = 20;
        this.Item.mana = 10;
        this.Item.useTime = 24;
        this.Item.useAnimation = 24;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.knockBack = 4.0;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 75, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
        this.Item.shoot = ModProjectile.getTypeByName('HighTidePro');
        this.Item.shootSpeed = 10.0;
    }
}