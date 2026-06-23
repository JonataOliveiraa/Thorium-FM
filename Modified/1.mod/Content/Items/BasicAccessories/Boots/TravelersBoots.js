import { Terraria } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';

export class TravelersBoots extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Boots/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 28;
        this.Item.accessory = true;
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 25, 0);
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.moveSpeed += 0.05;
        player.runAcceleration += 0.08;
    }
}