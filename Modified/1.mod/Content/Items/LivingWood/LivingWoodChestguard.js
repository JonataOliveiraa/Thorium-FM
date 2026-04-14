import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class LivingWoodChestguard extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/LivingWood/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.defense = 2;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 3, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
  }

  UpdateEquip(item, player) {
    player.minionDamage += 0.1
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("LivingLeaf"), 10)
      .AddIngredient(Terraria.ID.ItemID.Wood, 20)
      .AddTile(Terraria.ID.TileID.WorkBenches)
      .Register();
  }
}