import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class CriersLeggings extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Criers/' + this.constructor.name;
        this.regenBonus = 0.04
    }

    SetDefaults() {
        this.Item.defense = 2;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 4, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    UpdateEquip(item, player) {
        ThoriumPlayer.class.Bard.inspirationRegenBonus += this.regenBonus;
    }

    ModifyTooltipLines() {
        const displayValue = Math.round(this.regenBonus * 100).toString();
        this.TooltipLines[0] = ModLocalization.Translate(`ItemTooltip.InpirationRegenBonus`).replace('{0}', displayValue);
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName("Cloth"), 12)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}