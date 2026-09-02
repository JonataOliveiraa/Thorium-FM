import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class CampingCoat extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Vanity/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 22;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 25, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Leather, 8)
            .AddIngredient(ModItem.getTypeByName('Cloth'), 10)
            .AddTile(Terraria.ID.TileID.Loom)
            .Register();
    }
}
