import { ModRecipe } from '../../../../TL/ModRecipe.js';
import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';

export class TheGrandThunderBirdTrophy extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Tile/Trophies/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.maxStack = ModItem.CommonMaxStack;
        this.Item.value = Terraria.Item.buyPrice(0, 0, 20, 78);
        this.Item.material = false;
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.DefaultToPlaceableTile(240, 101);
    }
}