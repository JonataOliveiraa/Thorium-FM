import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class YewWoodLeggings extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/YewWood/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 4;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 60, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }


    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    UpdateEquip(player) {
        ThoriumPlayer.YewWoodAccumulated++
    }


    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('YewWood'), 35)
            .AddTile(Terraria.ID.TileID.DyeVat)
            .Register();
    }
}