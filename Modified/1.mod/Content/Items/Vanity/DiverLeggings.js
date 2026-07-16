import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from '../../../TL/ModItem.js';

export class DiverLeggings extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Vanity/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }
}