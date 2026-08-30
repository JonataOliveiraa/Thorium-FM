import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { ModItem } from './../../../TL/ModItem.js';

export class BloodHarvest extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetDefaultsToScythe();
        
        this.isScytheSoul = true;
        this.scytheSoulCharge = 1;
        this.soulEssenceStack = 1;

        this.Item.damage = 22;
        
        this.Item.width = 62;   
        this.Item.height = 46;
        this.Item.value = Terraria.Item.sellPrice(0, 4, 0, 0);
        this.Item.rare = 3;
        this.Item.shoot = ModProjectile.getTypeByName('BloodHarvestPro');
    }
    
    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(ModItem.getTypeByName('TheBlender'))
        .AddIngredient(ModItem.getTypeByName('BoneReaper'))
        .AddIngredient(ModItem.getTypeByName('BountifulHarvest'))
        .AddIngredient(ModItem.getTypeByName('MoltenThresher'))
        .AddTile(26)
        .Register();
    }
}