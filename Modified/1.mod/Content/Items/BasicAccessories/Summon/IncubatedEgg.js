import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModPlayer } from '../../../../TL/ModPlayer.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class IncubatedEgg extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Summon/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.accessory = true;
        ;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 70, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.IncubatedEggBuff = true
    }
}