import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class GelatinousGreaves extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Vanity/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 18;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = 2;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }

    AddRecipes() {
        const jelly = ModItem.getTypeByName('Jelly');
        if (!(jelly > 0)) return;
        this.CreateRecipe(1)
            .AddIngredient(jelly, 10)
            .AddIngredient(154, 30)
            .AddTile(16)
            .Register();
    }
}
