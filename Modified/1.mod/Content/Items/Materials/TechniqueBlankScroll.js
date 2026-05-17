import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class TechniqueBlankScroll extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Materials/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.maxStack = ModItem.CommonMaxStack;
        this.Item.value = Terraria.Item.buyPrice(0, 1, 20, 20);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }
}