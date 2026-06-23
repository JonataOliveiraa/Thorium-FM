import { Terraria } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';

export class TurboBoots extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Boots/' + this.constructor.name;
        this.MoveSpeedBonus = 5;
        this.JumpHeightBonus = 4;
    }

    SetDefaults() {
        this.Item.accessory = true;
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 50, 0);
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.moveSpeed += this.MoveSpeedBonus / 100;
        player.jumpSpeedBoost += this.JumpHeightBonus;
    }
}