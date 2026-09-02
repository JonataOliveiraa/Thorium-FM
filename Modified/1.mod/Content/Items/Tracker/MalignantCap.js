import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const SILK_COST = 10;
const THREAD_COST = 1;

export class MalignantCap extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Tracker/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 20;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('MalignantThread'), THREAD_COST)
            .AddIngredient(Terraria.ID.ItemID.Silk, SILK_COST)
            .AddTile(Terraria.ID.TileID.Loom)
            .Register();
    }
}
