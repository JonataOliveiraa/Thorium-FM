import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class SandstoneAxe extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Sandstone/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.axe = 11;

    // Hitbox
    this.Item.width = 40;
    this.Item.height = 40;

    // Weapon Damage
    this.Item.melee = true;
    this.SetWeaponValues(7, 4.5, 0);
    this.SetDefaultWeaponStyle(26, true);
    this.Item.useTime = 18;
    this.Item.useStyle = 1;
    this.Item.useTurn = true

    // Other
    this.Item.value = Terraria.Item.buyPrice(0, 0, 7, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("SandstoneIngot"), 7)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}