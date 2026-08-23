import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class ObsidianStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 30;
        this.Item.magic = true;
        this.Item.damage = 26;
        this.Item.channel = true;
        this.Item.mana = 14;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 3.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 3;
        this.Item.UseSound = Terraria.ID.SoundID.Item73;
        this.Item.shoot = ModProjectile.getTypeByName('ObsidianStaffPro');
        this.Item.shootSpeed = 8.0;
    }
    
    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(173, 20)
        .AddIngredient(175, 6)
        .AddTile(16)
        .Register();
    }
}