import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";

export class FallingTwilight extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetDefaultsToScythe();

        this.isScytheSoul = true;
        this.soulEssenceStack = 1;

        this.SetWeaponValues(24, 6.5, 4);

        this.Item.width = 52;
        this.Item.height = 46;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 8, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.shoot = ModProjectile.getTypeByName('FallingTwilightPro');
    }

    // Variante da Corrupcao. O par da Carnificina e a Blood Harvest.
    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('DownwardSpiral'), 1)
            .AddIngredient(ModItem.getTypeByName('BoneReaper'), 1)
            .AddIngredient(ModItem.getTypeByName('BountifulHarvest'), 1)
            .AddIngredient(ModItem.getTypeByName('MoltenThresher'), 1)
            .AddTile(Terraria.ID.TileID.DemonAltar)
            .Register();
    }
}
