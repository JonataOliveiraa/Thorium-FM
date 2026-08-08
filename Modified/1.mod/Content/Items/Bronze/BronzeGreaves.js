import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class BronzeGreaves extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Bronze/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 18;
    this.Item.height = 18;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 70, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.defense = 7;
  }

  UpdateEquip(item, player) {
    player.rangedCrit += 5;
    player.moveSpeed += 0.10;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName('BronzeAlloyFragments'), 16)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}
