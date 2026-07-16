import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";

export class TheBlender extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetDefaultsToScythe();

        this.isScytheSoul = true;
        this.soulEssenceStack = 1;

        this.SetWeaponValues(11, 6.5, 4)
        
        this.Item.width = 52;   
        this.Item.height = 42;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 27, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.shoot = ModProjectile.getTypeByName('TheBlenderPro');
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(1257, 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}