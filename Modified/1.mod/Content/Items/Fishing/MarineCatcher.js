import { Terraria, Microsoft } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class MarineCatcher extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Fishing/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.CloneDefaults(Terraria.ID.ItemID.WoodFishingPole);
        
        this.Item.fishingPole = 25;
        this.Item.shootSpeed = 12;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 50, 0);
        this.Item.shoot = ModProjectile.getTypeByName('BobberMarine');
    }
    
    HoldItem(item, player) {
        player.accFishingLine = true;
    }
}