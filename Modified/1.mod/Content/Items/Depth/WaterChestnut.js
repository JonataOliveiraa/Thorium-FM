import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class WaterChestnut extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Depth/' + this.constructor.name;
    }

    SetStaticDefaults() {
        this.ResearchUnlockCount = 30;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.useTime = 17;
        this.Item.useAnimation = 17;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.DrinkLiquid;
        this.Item.useTurn = true;
        this.Item.healLife = 50;
        this.Item.consumable = true;
        this.Item.potion = true;
        this.Item.maxStack = 9999;
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 15, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item2;
    }
}
