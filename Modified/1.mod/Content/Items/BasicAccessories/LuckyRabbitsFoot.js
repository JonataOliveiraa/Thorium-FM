import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class LuckyRabbitsFoot extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.accessory = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 15);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if(vanity) return;
        ThoriumPlayer.LuckyRabbitsFootEquipped = true
        player.luck += 0.03
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }
}