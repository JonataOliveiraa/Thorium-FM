import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class ChampionWing extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BossBuriedChampion/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 22;
        this.Item.height = 20;
        this.Item.accessory = true;
        this.Item.expert = true;
        this.Item.value = Terraria.Item.sellPrice(0,1,0,0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.SetWingStats(60, 6.0, 1);
    }
}
