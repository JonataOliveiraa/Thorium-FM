import { Terraria, Modules } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';
import { ModProjectile } from './../../../../TL/ModProjectile.js';

const { Color } = Modules;

export class TheSnowball extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Weapons/Melee/' + this.constructor.name;
  }

  SetDefaults() {
    // Hitbox
    this.Item.width = 32;
    this.Item.height = 32;

    this.Item.melee = true;
    this.Item.noMelee = true;
    this.Item.channel = true;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 6, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;

    this.SetWeaponValues(16, 4.5, 0);
    this.SetDefaultWeaponStyle(45, false);
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
    this.Item.noUseGraphic = true;

    // Shoot
    this.Item.shoot = ModProjectile.getTypeByName("TheSnowballProjectile");
    this.Item.shootSpeed = 11;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("IcyShard"), 8)
      .AddTile(Terraria.ID.TileID.WorkBenches)
      .Register();
  }

  GetAlpha(item, color) {
    return Color.White;
  }
}