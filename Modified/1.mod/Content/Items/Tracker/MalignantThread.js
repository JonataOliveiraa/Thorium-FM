import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class MalignantThread extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Tracker/' + this.constructor.name;
    }

    SetStaticDefaults() {
        this.ResearchUnlockCount = 5;
    }

    SetDefaults() {
        this.Item.width = 28;
        this.Item.height = 20;
        this.Item.maxStack = 9999;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }
}
