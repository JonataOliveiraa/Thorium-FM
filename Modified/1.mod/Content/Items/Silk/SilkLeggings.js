import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class SilkLeggings extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Silk/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.defense = 2;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 2, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
  }

  UpdateEquip(item, player) {
    player.statManaMax2 += 20
    player.manaRegenBonus += 0.07
  }

  AddRecipes() {
    this.CreateRecipe(1)
    .AddIngredient(Terraria.ID.ItemID.FallenStar, 5)
    .AddIngredient(Terraria.ID.ItemID.Silk, 5)
    .AddTile(Terraria.ID.TileID.WorkBenches)
    .Register();
  }
}