import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { gRecipes } from '../../Global/gRecipes.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class SilverSpearTip extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 24;
        this.Item.accessory = true;
        this.Item.rare = 0;
        this.Item.value = Terraria.Item.sellPrice(0,0,30,0);
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        ThoriumPlayer.spearNormal = true;
    }
    
    AddRecipes() {
        this.CreateRecipe(1)
        .AddRecipeGroup(gRecipes.CustomGroups.get('SilverBar'))
        .AddIngredient(Terraria.ID.ItemID.SilverBar, 12)
        .AddTile(Terraria.ID.TileID.Anvils)
        .Register();
    }
}