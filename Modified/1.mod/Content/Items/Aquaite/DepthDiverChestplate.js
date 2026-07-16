import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class DepthDiverChestplate extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Aquaite/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 7;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 80, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 18)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}