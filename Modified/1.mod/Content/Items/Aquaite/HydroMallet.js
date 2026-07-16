import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class HydroMallet extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Aquaite/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.hammer = 60;

    // Hitbox
    this.Item.width = 40;
    this.Item.height = 40;

    // Weapon Damage
    this.Item.melee = true;
    this.SetWeaponValues(11, 6, 4);
    this.SetDefaultWeaponStyle(26, true);
    this.Item.useTime = 24;
    this.Item.useStyle = 1;
    this.Item.useTurn = true

    // Other
    this.Item.value = Terraria.Item.buyPrice(0, 0, 8, 0);
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