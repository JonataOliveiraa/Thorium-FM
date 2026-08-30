import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { AmmoHelper } from './../../../Common/AmmoHelper.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

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

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const projType = AmmoHelper.Consume(player, item.useAmmo);
        if (projType <= 0) return false;

        NewProjectile(null, position, velocity, projType, damage, knockBack, player.whoAmI, 0, 0, 0, null);
        return false;
    }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("SandstoneIngot"), 8)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}