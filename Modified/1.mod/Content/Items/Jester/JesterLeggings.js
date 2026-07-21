import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const ItemID = Terraria.ID.ItemID

export class JesterLeggings extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Jester/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.defense = 4;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 70, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
  }

  UpdateEquip() {
    ThoriumPlayer.class.Bard.inspirationRegenBonus += 0.05
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ItemID.Silk, 5)
      .AddIngredient(ItemID.CrimtaneBar, 15)
      .AddIngredient(ItemID.TissueSample, 10)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}