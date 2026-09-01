import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class HighQualityReed extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/BasicAccessories/Bard/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 24;
    this.Item.height = 28;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.accessory = true;
  }

  UpdateAccessory(item, player, vanity) {
    if (vanity) return;

    ThoriumPlayer.class.Bard.multiplier += 0.06;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(2260, 10)
      .AddTile(Terraria.ID.TileID.Sawmill)
      .Register();
  }
}
