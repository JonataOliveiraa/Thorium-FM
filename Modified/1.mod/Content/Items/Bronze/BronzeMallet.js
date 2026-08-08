import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

export class BronzeMallet extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Bronze/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 40;
    this.Item.height = 40;
    this.Item.damage = 11;
    this.Item.melee = true;
    this.Item.hammer = 70;
    this.Item.useTime = 14;
    this.Item.useAnimation = 20;
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
    this.Item.knockBack = 6;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
    this.Item.autoReuse = true;
    this.Item.useTurn = true;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName('BronzeAlloyFragments'), 8)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}
