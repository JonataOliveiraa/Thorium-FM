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
        this.scytheSoulCharge = 1;
        this.soulEssenceStack = 1;

        this.Item.damage = 18;
        
        this.Item.width = 62;   
        this.Item.height = 46;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = 3;
        this.Item.shoot = ModProjectile.getTypeByName('MoltenThresherPro');
    }
    
    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(175, 15)
        .AddTile(16)
        .Register();
    }
}