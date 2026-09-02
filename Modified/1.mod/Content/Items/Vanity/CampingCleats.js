import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class CampingCleats extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Vanity/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 18;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 25, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Leather, 6)
            .AddIngredient(ModItem.getTypeByName('Cloth'), 8)
            .AddTile(Terraria.ID.TileID.Loom)
            .Register();
    }
}
