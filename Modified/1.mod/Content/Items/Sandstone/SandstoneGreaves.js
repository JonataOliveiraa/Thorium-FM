import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class SandstoneGreaves extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Sandstone/' + this.constructor.name;
  }

  SetDefaults() {
    // Stats
    this.Item.defense = 2;

    // Other
    this.Item.value = Terraria.Item.sellPrice(0, 0, 8, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
  }

  UpdateEquip(item, player) {
    player.moveSpeed += 0.03;
    player.rangedDamage += 0.05;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("SandstoneIngot"), 8)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}