import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class HydroAxe extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Aquaite/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.axe = 13;

    this.Item.width = 40;
    this.Item.height = 40;

    this.Item.melee = true;
    this.SetWeaponValues(10, 4.5, 4);
    this.SetDefaultWeaponStyle(23, true);
    this.Item.useStyle = 1;
    this.Item.useTurn = true

    // Other
    this.Item.value = Terraria.Item.buyPrice(0, 0, 36, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Green;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("AquaiteBar"), 10)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}