import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class ViscountMask extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Viscount/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.ShimmerTransformToItem[this.Type] = -1;
    }

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 28;
        this.Item.rare = 2;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.vanity = true;
    }
}
