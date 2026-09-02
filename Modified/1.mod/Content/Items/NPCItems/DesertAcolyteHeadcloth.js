import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class DesertAcolyteHeadcloth extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NPCItems/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 20;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }
}
