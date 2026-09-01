import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class ShockAbsorber extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/GraniteEnergyStorm/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 28;
        this.Item.height = 28;
        this.Item.value = Terraria.Item.sellPrice(0,0,50,0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.class.Bard.inspirationRegenBonus += 0.1;
        ThoriumPlayer.accShockAbsorber = true;
    }
}
