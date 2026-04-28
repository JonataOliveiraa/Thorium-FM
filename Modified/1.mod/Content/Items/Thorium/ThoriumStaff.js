import { ThoriumAnvil } from '../../Global/Tiles/ThoriumAnvil.js';
import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class ThoriumStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Thorium/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.magic = true;
        this.Item.mana = 4;
        this.Item.shoot = ModProjectile.getTypeByName('ThoriumBolt');
        this.Item.shootSpeed = 15;
        this.Item.useStyle = 5

        this.SetWeaponValues(12, 4, 4);
        this.SetDefaultWeaponStyle(24, true);

        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item60;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName("ThoriumBar"), 8)
            .AddTile(ThoriumAnvil.Type)
            .Register();
    }
}