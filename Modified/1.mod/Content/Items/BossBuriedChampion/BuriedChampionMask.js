import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class BuriedChampionMask extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/BossBuriedChampion/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 26;
    this.Item.height = 28;
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
    this.Item.vanity = true;
  }
}
