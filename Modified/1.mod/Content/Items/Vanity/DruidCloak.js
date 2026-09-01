import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class DruidCloak extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Vanity/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 28;
        this.Item.value = Terraria.Item.sellPrice(0,0,20,0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.accessory = true;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }
}
