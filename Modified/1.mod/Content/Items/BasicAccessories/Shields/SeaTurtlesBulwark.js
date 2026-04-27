import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';

export class SeaTurtlesBulwark extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Shields/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.accessory = true;
        this.Item.defense = 2;
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.statDefense += 2;
    }
}