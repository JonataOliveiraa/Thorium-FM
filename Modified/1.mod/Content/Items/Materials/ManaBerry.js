import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class ManaBerry extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Materials/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 14;
    this.Item.height = 18;
    this.Item.maxStack = 9999;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 2, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
  }
}
