import { Terraria } from "../../../../TL/ModImports.js";
import { ModItem } from "../../../../TL/ModItem.js";


export class MixTape extends ModItem {
    constructor() {
        super();
        this.Texture = "Textures/Items/BasicAccessories/Bard/" + this.constructor.name;
    }

    SetDefaults() {
        this.Item.accessory = true;
        ;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
    }
}