import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const SNOW_BLOCK = 147;

export class IronFlailCore extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 24;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 15, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.accIronFlailCore = true;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.IronBar, 6)
            .AddRecipeGroup('IronBar')
            .AddIngredient(SNOW_BLOCK, 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
