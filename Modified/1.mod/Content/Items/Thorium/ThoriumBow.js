import { ThoriumAnvil } from '../../Global/Tiles/ThoriumAnvil.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class ThoriumBow extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Thorium/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.ranged = true;
        this.Item.noMelee = true
        this.Item.shoot = 1;
        this.Item.shootSpeed = 6;
        this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;

        this.SetWeaponValues(14, 0, 4);
        this.SetDefaultWeaponStyle(30, true);

        this.Item.value = Terraria.Item.sellPrice(0, 0, 25, 25);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item5;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName("ThoriumBar"), 7)
            .AddTile(ThoriumAnvil.Type)
            .Register();
    }
}