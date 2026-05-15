import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class SandstoneBow extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Sandstone/' + this.constructor.name;
  }

  SetDefaults() {
    // Hitbox
    this.Item.width = 42;
    this.Item.height = 30;

    // Weapon Damage
    this.Item.ranged = true;
    this.Item.noMelee = true;
    this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;
    this.Item.shoot = 1;
    this.Item.shootSpeed = 7;
    this.SetWeaponValues(12, 1, 0);
    this.SetDefaultWeaponStyle(22, true);
    this.Item.useStyle = 5;

    // Other
    this.Item.value = Terraria.Item.sellPrice(0, 0, 8, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.UseSound = Terraria.ID.SoundID.Item5;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("SandstoneIngot"), 8)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}