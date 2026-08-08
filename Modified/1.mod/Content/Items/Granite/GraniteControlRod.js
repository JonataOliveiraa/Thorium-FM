import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class GraniteControlRod extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Granite/' + this.constructor.name;
    }

    SetDefaults() {
        this.CloneDefaults(Terraria.ID.ItemID.WoodFishingPole);

        this.Item.fishingPole = 35;
        this.Item.shootSpeed = 15;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.shoot = ModProjectile.getTypeByName('GraniteControlRodBobber');
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('GraniteEnergyCore'), 10)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
