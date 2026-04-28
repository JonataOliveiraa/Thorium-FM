import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ThoriumBar extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Materials/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.maxStack = ModItem.CommonMaxStack;
    this.Item.value = Terraria.Item.buyPrice(0, 0, 8, 50);
    this.Item.material = true
    this.Item.rare = Terraria.ID.ItemRarityID.Blue
  }

  AddRecipes() {
      this.CreateRecipe(1)
          .AddIngredient(ModItem.getTypeByName('ThoriumOre'), 4)
          .AddTile(Terraria.ID.TileID.ChlorophyteExtractinator)
          .Register();
    }
}