import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class FrostFury extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Icy/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.ranged = true;
    this.Item.noMelee = true
    this.Item.shoot = 1;
    this.Item.shootSpeed = 6;
    this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;

    this.SetWeaponValues(8, 0, 0);
    this.SetDefaultWeaponStyle(30, true);

    this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 25);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
    this.Item.UseSound = Terraria.ID.SoundID.Item5;
  }

AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("IcyShard"), 7)
      .AddTile(Terraria.ID.TileID.WorkBenches)
      .Register();
  }
}