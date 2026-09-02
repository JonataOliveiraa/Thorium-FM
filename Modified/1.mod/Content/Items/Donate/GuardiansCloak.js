import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class GuardiansCloak extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }

    SetStaticDefaults() {
        const sets = Terraria.ID.ArmorIDs.Body.Sets;
        sets.IncludeCapeFrontAndBack[this.Item.bodySlot].frontCape = this.Item.frontSlot;
        sets.IncludedCapeFront[this.Item.bodySlot] = this.Item.frontSlot;
    }

    SetDefaults() {
        this.Item.width = 18;
        this.Item.height = 18;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }
}
