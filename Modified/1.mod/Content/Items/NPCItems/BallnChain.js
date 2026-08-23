import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class BallnChain extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NPCItems/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 28;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = 2;
        this.Item.accessory = true;
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        player.endurance += 0.1;
        player.moveSpeed -= 0.1;
        player.jumpSpeedBoost -= 0.3;
    }
}