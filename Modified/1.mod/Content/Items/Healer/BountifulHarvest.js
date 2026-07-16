import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";

export class BountifulHarvest extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetDefaultsToScythe();

        this.isScytheSoul = true;
        this.soulEssenceStack = 1;

        this.SetWeaponValues(14, 6.5, 4)
        
        this.Item.width = 56;   
        this.Item.height = 44;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.shoot = ModProjectile.getTypeByName('BountifulHarvestPro');
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(331, 10)
            .AddIngredient(209, 4)
            .AddIngredient(210, 2)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}