import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";

export class AquaiteScythe extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Aquaite/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetDefaultsToScythe();

        this.isScytheSoul = true;
        this.soulEssenceStack = 1;

        this.Item.damage = 14;
        this.Item.width = 54;   
        this.Item.height = 38;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 2;
        this.Item.shoot = ModProjectile.getTypeByName('AquaiteScythePro');
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 14)
            .AddIngredient(ModItem.getTypeByName('DepthScales'), 5)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}