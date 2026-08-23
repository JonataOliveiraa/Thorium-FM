import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ThoriumPlayer } from './../../Global/ThoriumPlayer.js';

export class YewWoodFlintlock extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/YewWood/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 42;
        this.Item.height = 30;
        this.Item.ranged = true;
        this.Item.damage = 12;
        this.Item.useTime = 16;
        this.Item.useAnimation = 16;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 1.0;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 30, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item11;
        this.Item.shoot = 14;
        this.Item.shootSpeed = 6.0;
        this.Item.useAmmo = Terraria.ID.AmmoID.Bullet;
    }
    
    HoldItem(item, player) {
        ThoriumPlayer.itemYewWoodShrapnel = true;
    }

    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(ModItem.getTypeByName('YewWood'), 18)
        .AddTile(Terraria.ID.TileID.DyeVat)
        .Register();
    }
}