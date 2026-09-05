import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const DEFENSE = 1;

export class FamilyHeirloom extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 28;
        this.Item.value = 0;
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.statDefense += DEFENSE;
    }
}
