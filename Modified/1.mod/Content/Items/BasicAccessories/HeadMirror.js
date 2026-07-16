import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { gRecipes } from '../../Global/gRecipes.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class HeadMirror extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.accessory = true;
        ;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.class.Healer.healPowerExtraValue += 1
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('SmoothCoal'), 4)
            .AddRecipeGroup(gRecipes.CustomGroups.get('SilverBar'))
            .AddIngredient(Terraria.ID.ItemID.SilverBar, 6)
            .AddIngredient(ModItem.getTypeByName('LifeQuartzOre'), 4)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register()
    }
}