import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ExampleBeard extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Accessories/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ArmorIDs.Beard.Sets.UseHairColor[this.Item.beardSlot] = true;
    }
    
    SetDefaults() {
        this.Item.accessory = true;
        this.Item.vanity = true;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.color = Terraria.Main.LocalPlayer.hairColor;
    }
}