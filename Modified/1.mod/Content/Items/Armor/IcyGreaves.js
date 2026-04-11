import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class IcyGreaves extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Armor/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.defense = 3;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 6, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
  }
  
  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("IcyShard"), 6)
      .AddTile(Terraria.ID.TileID.WorkBenches)
      .Register();
  }
}