import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { gRecipes } from '../../Global/gRecipes.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class PacifistNecklace extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.accessory = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        if (ThoriumPlayer.InCombat) return;

        ThoriumPlayer.class.Healer.healPowerExtraValue += 2
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddRecipeGroup(gRecipes.CustomGroups.get('GoldBar'))
            .AddIngredient(Terraria.ID.ItemID.GoldBar, 6)
            .AddIngredient(ModItem.getTypeByName('PurifiedShards'), 2)
            .AddIngredient(Terraria.ID.ItemID.Chain, 2)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}
