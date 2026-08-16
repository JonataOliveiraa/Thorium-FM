import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';

export class AromaticBiscuit extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Consumable/Food/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 20;
    this.Item.height = 20;
    this.Item.maxStack = 1;
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
  }
}
