import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class MusicNotes extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/BasicAccessories/Bard/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 24;
    this.Item.height = 28;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 25, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.accessory = true;
  }

  UpdateAccessory(item, player, vanity, hideVisual) {
    if (vanity) return;
    ThoriumPlayer.class.Bard.bardBuffDurationFlat += 180;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName('Cloth'), 3)
      .AddIngredient(Terraria.ID.ItemID.BlackInk, 1)
      .AddTile(Terraria.ID.TileID.WorkBenches)
      .Register();
  }
}
