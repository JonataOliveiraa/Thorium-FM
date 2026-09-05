import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const DAMAGE_BONUS = 0.12;

export class DemonTongue extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.LightRed;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.darkAura = true;
        ThoriumPlayer.class.Healer.multiplier += DAMAGE_BONUS;
    }
}
