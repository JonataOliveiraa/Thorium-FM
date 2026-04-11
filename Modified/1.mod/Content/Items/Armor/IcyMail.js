import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class IcyMail extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Armor/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.defense = 4;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 7, 50);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("IcyShard"), 8)
      .AddTile(Terraria.ID.TileID.WorkBenches)
      .Register();
  }
}