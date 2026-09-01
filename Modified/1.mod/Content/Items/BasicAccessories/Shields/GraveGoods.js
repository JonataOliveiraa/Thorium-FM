import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class GraveGoods extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Shields/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 24;
        this.Item.value = Terraria.Item.sellPrice(0,1,0,0);
        this.Item.rare = 2;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player) {
        ThoriumPlayer.graveGoods = true;
    }
}