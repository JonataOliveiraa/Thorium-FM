import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class LivingWoodChestguard extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Armor/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.defense = 2;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
    }

    UpdateEquip(item, player) {
        player.minionDamage += 1
    }
}