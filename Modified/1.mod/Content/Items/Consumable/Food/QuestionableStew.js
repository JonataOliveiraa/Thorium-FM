import { Terraria } from '../../../../TL/ModImports.js';
import { ModCookFood, WELL_FED_RECIPE } from '../../../../Common/ModCookFood.js';

export class QuestionableStew extends ModCookFood {
  constructor() {
    super();
    this.Texture = 'Items/Consumable/Food/' + this.constructor.name;

    this.foodHealLife = 75;
    this.secondaryBuff = Terraria.ID.BuffID.Battle;
    this.wellFedDuration = WELL_FED_RECIPE;
  }

  CookDefaults() {
    this.Item.width = 32;
    this.Item.height = 30;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 4, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
  }
}
