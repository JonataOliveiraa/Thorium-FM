import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class SteelChestplate extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Steel/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.defense = 6;
    this.Item.value = Terraria.Item.buyPrice(0, 1, 25, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.maxStack = 1
  }
}