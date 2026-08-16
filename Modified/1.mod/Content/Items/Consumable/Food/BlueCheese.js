import { Terraria } from '../../../../TL/ModImports.js';
import { ModCookFood, WELL_FED_RECIPE } from '../../../../Common/ModCookFood.js';

export class BlueCheese extends ModCookFood {
  constructor() {
    super();
    this.Texture = 'Items/Consumable/Food/' + this.constructor.name;

    this.foodHealLife = 75;
    this.secondaryBuff = Terraria.ID.BuffID.Shine;
    this.wellFedDuration = WELL_FED_RECIPE;
  }

  CookDefaults() {
    this.Item.width = 28;
    this.Item.height = 28;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 4, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
  }
}
