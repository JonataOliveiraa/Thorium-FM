import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { VanquisherMedalCurrency } from './VanquisherMedalCurrency.js';

export class VanquisherMedal extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Tracker/' + this.constructor.name;
    }

    SetStaticDefaults() {
        this.ResearchUnlockCount = 50;
    }

    PostSetupContent() {
        VanquisherMedalCurrency.Initialize(this.Type);
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.maxStack = 9999;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Quest;
    }
}
