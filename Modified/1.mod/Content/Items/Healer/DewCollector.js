import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const GLASS = 530;

export class DewCollector extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.aloePlant = true;
        ThoriumPlayer.accDewCollector = true;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('AloeLeaf'), 1)
            .AddIngredient(Terraria.ID.ItemID.IronBar, 8)
            .AddRecipeGroup('IronBar')
            .AddIngredient(GLASS, 15)
            .AddTile(Terraria.ID.TileID.Bookcases)
            .Register();
    }
}
