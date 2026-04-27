import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class ColdFront extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Icy/' + this.constructor.name;
  }

  SetDefaults() {
    // Hitbox
    this.Item.width = 42;
    this.Item.height = 42;

    this.Item.melee = true;
    this.Item.noMelee = true;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 25);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
    this.Item.maxStack = 1

    this.SetWeaponValues(10, 3, 0);
    this.SetDefaultWeaponStyle(25, false);
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
    this.Item.noUseGraphic = true;

    // Shoot
    this.Item.shoot = ModProjectile.getTypeByName("ColdFrontPro");
    this.Item.shootSpeed = 8;
  }

  CanUseItem(item, player) {
    return player.ownedProjectileCounts[this.Item.shoot] < 1;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("IcyShard"), 7)
      .AddTile(Terraria.ID.TileID.WorkBenches)
      .Register();
  }
}