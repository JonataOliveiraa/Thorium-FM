import { Terraria } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class MarchingBoots extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Boots/' + this.constructor.name;
        this.MoveSpeedBonus = 5;
        this.RunningInspirationRegenBonus = 0.5;
    }

    SetDefaults() {
        this.Item.accessory = true;
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 50, 0);
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.moveSpeed += this.MoveSpeedBonus / 100;

        if (Math.abs(player.velocity.X) > 0.1) {
            ThoriumPlayer.class.Bard.inspirationRegenBonus += this.RunningInspirationRegenBonus;
        }
    }
}