import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const JUMP_BOOST = 2.5;

export class IncandescentAlacrity extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.value = Terraria.Item.sellPrice(0, 7, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.accIncandescentAlacrity = true;
        player.noFallDmg = true;
        player.jumpSpeedBoost = JUMP_BOOST;
    }
}
