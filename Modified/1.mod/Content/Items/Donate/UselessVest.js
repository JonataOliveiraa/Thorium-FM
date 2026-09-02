import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class UselessVest extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }

    SetStaticDefaults() {
        ThoriumPlayer.uselessVestWaist = this.Item.waistSlot;
        ThoriumPlayer.uselessVestBody = this.Item.bodySlot;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 22;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }
}
