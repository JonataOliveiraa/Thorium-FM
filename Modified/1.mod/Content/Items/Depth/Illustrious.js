import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class Illustrious extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Depth/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.Yoyo[this.Type] = true;
    }

    SetDefaults() {
        this.CloneDefaults(3317);
        this.Item.shoot = ModProjectile.getTypeByName('IllustriousPro');
        this.Item.rare = 2;
        this.Item.crit = 10;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.damage = 24;
        this.Item.knockBack = 4;
    }

    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 8)
        .AddIngredient(4412)
        .AddTile(16)
        .Register();
    }
}