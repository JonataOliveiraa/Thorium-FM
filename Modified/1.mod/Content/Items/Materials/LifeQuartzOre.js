import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class LifeQuartzOre extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Materials/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.maxStack = ModItem.CommonMaxStack;
    this.Item.value = Terraria.Item.buyPrice(0, 0, 1, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue
    this.DefaultToPlaceableTile(Terraria.ID.TileID.TeamBlockRed, 0)
  }
}