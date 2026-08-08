import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class GraniteGreaves extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Granite/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 18;
        this.Item.height = 18;
        this.Item.defense = 10;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 70, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('GraniteEnergyCore'), 16)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
