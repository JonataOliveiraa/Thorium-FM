import { ModBuff } from '../../../TL/ModBuff.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class SpiritsGrace extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.accessory = true;
        this.Item.material = true;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if(vanity) return;
        
        player.statLifeMax += player.statLifeMax * 0.15
        ThoriumPlayer.SpiritsGraceEquipped = true
    }


    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }
}