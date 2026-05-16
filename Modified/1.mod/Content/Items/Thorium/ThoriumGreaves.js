import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ThoriumGreaves extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Thorium/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 5;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 60, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }


    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    UpdateEquip(item, player) {
        player.meleeCrit += 2;
        player.rangedCrit += 2;
        player.magicCrit += 2;
    }


    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('ThoriumBar'), 15)
            .AddTile(Terraria.ID.TileID.ChlorophyteExtractinator)
            .Register();
    }
}