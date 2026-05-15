import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class SandstonePickaxe extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Sandstone/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.pick = 55;

    // Hitbox
    this.Item.width = 40;
    this.Item.height = 40;

    // Weapon Damage
    this.Item.melee = true;
    this.SetWeaponValues(6, 2, 0);
    this.SetDefaultWeaponStyle(20, true);
    this.Item.useTime = 18;
    this.Item.useStyle = 1;
    this.Item.useTurn = true

    // Other
    this.Item.value = Terraria.Item.buyPrice(0, 0, 9, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("SandstoneIngot"), 9)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}