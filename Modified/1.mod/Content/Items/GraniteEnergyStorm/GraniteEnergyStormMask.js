import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class GraniteEnergyStormMask extends ModItem {
    constructor() {
        super();
        // O ItemLoader detecta a textura _Head irma e preenche o headSlot sozinho.
        this.Texture = 'Items/GraniteEnergyStorm/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.ShimmerTransformToItem[this.Type] = -1;
    }

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 28;
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.vanity = true;
    }
}
