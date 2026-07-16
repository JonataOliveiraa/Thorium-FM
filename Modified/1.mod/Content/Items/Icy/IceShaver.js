import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";

export class IceShaver extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Icy/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetDefaultsToScythe();

        this.isScytheSoul = true;
        this.soulEssenceStack = 1;

        this.SetWeaponValues(7, 6.5, 4)
        
        this.Item.width = 46;   
        this.Item.height = 38;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 0, 20);
        this.Item.rare = 2;
        this.Item.shoot = ModProjectile.getTypeByName('IceShaverPro');
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('IcyShard'), 8)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}