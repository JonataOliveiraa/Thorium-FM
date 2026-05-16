import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class ClericEmblem extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;

        this.percetageDamage = 0.15
    }

    SetDefaults() {
        this.Item.accessory = true;
        this.Item.material = true;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.LightRed;
    }

    UpdateAccessory(item, player, vanity) {
        if (vanity) return;

        ThoriumPlayer.class.Healer.multiplier += this.percetageDamage;
    }

    ModifyTooltipLines() {
        this.TooltipLines[0] = ModLocalization.Translate('ItemTooltip.radiantDamage').replace('{0}', this.percetageDamage * 100)
    }
}