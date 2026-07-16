import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";

export class WoodenBaton extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetDefaultsToScythe();

        this.isScytheSoul = false;

        this.SetWeaponValues(5, 6.5, 4)
        
        this.Item.width = 36;   
        this.Item.height = 36;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 0, 20);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.shoot = ModProjectile.getTypeByName('WoodenBatonPro');
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddRecipeGroup('Wood')
            .AddIngredient(Terraria.ID.ItemID.Wood, 8)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}