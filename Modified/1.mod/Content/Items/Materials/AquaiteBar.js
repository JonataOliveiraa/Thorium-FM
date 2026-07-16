import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class AquaiteBar extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Materials/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.maxStack = ModItem.CommonMaxStack;
    this.Item.value = Terraria.Item.buyPrice(0, 0, 13, 23);
    this.Item.rare = Terraria.ID.ItemRarityID.Green
  }

  AddRecipes() {
    this.CreateRecipe(1)
    .AddIngredient(ModItem.getTypeByName('AquaiteOre'), 5)
    .AddTile(Terraria.ID.TileID.Furnaces)
    .Register()
  }
}