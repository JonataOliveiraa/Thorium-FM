import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

let _bobberType = -1;

export class ChampionCatcher extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Bronze/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 40;
    this.Item.height = 40;
    this.Item.useTime = 8;
    this.Item.useAnimation = 8;
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
    this.Item.noMelee = true;
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.fishingPole = 35;
    this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
    this.Item.shootSpeed = 15;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;

    if (_bobberType === -1) _bobberType = ModProjectile.getTypeByName('ChampionCatcherBobber') ?? -2;
    if (_bobberType >= 0) this.Item.shoot = _bobberType;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName('BronzeAlloyFragments'), 10)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}
