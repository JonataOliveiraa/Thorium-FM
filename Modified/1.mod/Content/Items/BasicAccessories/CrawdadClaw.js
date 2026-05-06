import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class CrawdadClaw extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.accessory = true;
        this.Item.material = true;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.CrawdadClawEquipped = true;

        if (!ThoriumPlayer.InCombat) return;

        const time = ThoriumPlayer.CombatTimeAccumulated;

        let value = 0;

        if (time >= 180) value = 1;
        if (time >= 300) value = 2;

        player.armorPenetration += value;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }
}