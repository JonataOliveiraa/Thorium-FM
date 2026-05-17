import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class CoralPickaxe extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Coral/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.melee = true;
    this.Item.pick = 50;

    this.SetWeaponValues(6, 2, 0);
    this.SetDefaultWeaponStyle(18, true)
    this.Item.useTime = 12;
    this.Item.useTurn = true

    this.Item.value = Terraria.Item.sellPrice(0, 0, 6, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(Terraria.ID.ItemID.Coral, 8)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}