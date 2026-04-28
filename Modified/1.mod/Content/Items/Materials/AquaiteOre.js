import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class AquaiteOre extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Materials/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.maxStack = ModItem.CommonMaxStack;
    this.Item.value = Terraria.Item.buyPrice(0, 0, 4, 10);
    this.Item.material = true
    this.Item.rare = Terraria.ID.ItemRarityID.Green

    this.DefaultToPlaceableTile(Terraria.ID.TileID.AncientBlueBrick, 0)
  }
}