import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ExampleWings extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Accessories/' + this.constructor.name;
    }
    
    SetDefaults() {
        // SetWingStats(flyTime, flySpeedOverride, accelerationMultiplier);
        this.SetWingStats(360, 12.0, 5);
        
        this.Item.accessory = true;
        this.Item.value = Terraria.Item.sellPrice(0, 10, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }
}