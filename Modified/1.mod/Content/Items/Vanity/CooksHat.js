import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class CooksHat extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Vanity/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 18;
        // sellPrice = buyPrice * 5, entao 20 de prata da' 1 ouro de preco na loja do Cook.
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }
}
