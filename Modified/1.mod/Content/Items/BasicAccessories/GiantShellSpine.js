import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class GiantShellSpine extends ModItem {
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

        ThoriumPlayer.GiantShellSpineEquipped = true;

        if (!ThoriumPlayer.InCombat) return;

        const thresholds = [60, 120, 180, 250];
        const time = ThoriumPlayer.CombatTimeAccumulated;

        let value = 0;

        for (let i = 0; i < thresholds.length; i++) {
            if (time > thresholds[i]) value++;
        }

        player.statDefense += value;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }
}