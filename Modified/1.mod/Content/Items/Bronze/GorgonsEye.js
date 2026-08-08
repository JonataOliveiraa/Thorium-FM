import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

let _yoyoType = -1;

export class GorgonsEye extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Bronze/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.ID.ItemID.Sets.Yoyo[this.Item.type] = true;
  }

  SetDefaults() {
    this.Item.width = 30;
    this.Item.height = 30;
    this.Item.damage = 24;
    this.Item.melee = true;
    this.Item.useTime = 25;
    this.Item.useAnimation = 25;
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
    this.Item.noMelee = true;
    this.Item.noUseGraphic = true;
    this.Item.knockBack = 2;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
    this.Item.channel = true;
    this.Item.shootSpeed = 16;

    if (_yoyoType === -1) _yoyoType = ModProjectile.getTypeByName('GorgonsEyePro') ?? -2;
    if (_yoyoType >= 0) this.Item.shoot = _yoyoType;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName('BronzeAlloyFragments'), 8)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}
