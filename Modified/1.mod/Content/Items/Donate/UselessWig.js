import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class UselessWig extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }

    SetStaticDefaults() {
        ThoriumPlayer.uselessWigFront = this.Item.frontSlot;
        ThoriumPlayer.uselessWigHead = this.Item.headSlot;
    }

    SetDefaults() {
        this.Item.width = 32;
        this.Item.height = 38;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }
}
