import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class OpalStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.damage = 16;
        this.Item.magic = true;
        this.Item.mana = 5;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 35;
        this.Item.useAnimation = 35;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 3.75;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 15, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
        this.Item.shoot = ModProjectile.getTypeByName('AquamarineStaffPro');
        this.Item.shootSpeed = 7.0;
        this.Item.autoReuse = true;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.IronBar, 10)
            .AddIngredient(ModItem.getTypeByName('OpalGem'), 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}