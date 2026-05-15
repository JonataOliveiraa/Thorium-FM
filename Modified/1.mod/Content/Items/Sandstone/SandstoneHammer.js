import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class SandstoneHammer extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Sandstone/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.hammer = 55;

    // Hitbox
    this.Item.width = 40;
    this.Item.height = 40;

    // Weapon Damage
    this.Item.melee = true;
    this.SetWeaponValues(9, 5.5, 0);
    this.SetDefaultWeaponStyle(28, true);
    this.Item.useTime = 22;
    this.Item.useStyle = 1;
    this.Item.useTurn = true

    // Other
    this.Item.value = Terraria.Item.buyPrice(0, 0, 8, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("SandstoneIngot"), 8)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}