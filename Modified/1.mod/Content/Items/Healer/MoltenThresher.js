import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";

export class MoltenThresher extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetDefaultsToScythe();

        this.isScytheSoul = true;
        this.soulEssenceStack = 1;

        this.SetWeaponValues(18, 6.5, 4);

        this.Item.width = 64;
        this.Item.height = 46;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.shoot = ModProjectile.getTypeByName('MoltenThresherPro');
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.HellstoneBar, 15)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
