import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _pro1 = -1, _pro2 = -1;

export class GorgonGazeStaff extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Bronze/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Item.staff[this.Item.type] = true;
  }

  SetDefaults() {
    this.Item.damage = 14;
    this.Item.magic = true;
    this.Item.mana = 10;
    this.Item.width = 30;
    this.Item.height = 30;
    this.Item.useTime = 28;
    this.Item.useAnimation = 28;
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
    this.Item.noMelee = true;
    this.Item.autoReuse = true;
    this.Item.knockBack = 0;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    this.Item.UseSound = Terraria.ID.SoundID.Item34;
    this.Item.shootSpeed = 0.1;

    if (_pro1 === -1) _pro1 = ModProjectile.getTypeByName('GorgonGazeStaffPro') ?? -2;
    if (_pro1 >= 0) this.Item.shoot = _pro1;
  }

  ModifyShootStats(item, player, stats) {
    if (player.whoAmI === Terraria.Main.myPlayer) {
      stats.position = Terraria.Main.MouseWorld;
    }
  }

  HoldItem(item, player) {
    if (_pro2 === -1) _pro2 = ModProjectile.getTypeByName('GorgonGazeStaffPro2') ?? -2;

    if (_pro2 > 0 && player.whoAmI === Terraria.Main.myPlayer) {
      if (player.ownedProjectileCounts[_pro2] < 1) {
        const source = null;
        NewProjectile(source, player.Center, Vector2.Zero, _pro2, 0, 0, player.whoAmI, 0, 0, 0, null);
      }
    }
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName('BronzeAlloyFragments'), 10)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}
