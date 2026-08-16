import { Terraria } from '../../../../TL/ModImports.js';
import { ModCookFood, WELL_FED_BASIC } from '../../../../Common/ModCookFood.js';

export class CherryPie extends ModCookFood {
  constructor() {
    super();
    this.Texture = 'Items/Consumable/Food/' + this.constructor.name;

    this.foodHealLife = 50;
    this.secondaryBuff = Terraria.ID.BuffID.Regeneration;
    this.wellFedDuration = WELL_FED_BASIC;
  }

  CookDefaults() {
    this.Item.width = 38;
    this.Item.height = 24;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 2, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
  }
}
