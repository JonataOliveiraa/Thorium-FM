import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class BloomingBow extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/ArcaneWeapon/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.ranged = true;
    this.Item.noMelee = true
    this.Item.shoot = 1;
    this.Item.shootSpeed = 3;
    this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;

    this.SetWeaponValues(10, 1, 4);
    this.SetDefaultWeaponStyle(18, true);

    this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Green;
    this.Item.UseSound = Terraria.ID.SoundID.Item5;
  }
  
  Shoot(item, player, position, velocity, type, damage, knockBack) {
    
    NewProjectile(
        player.GetProjectileSource_Item_WithPotentialAmmo(item, item.useAmmo),
        position,
        Vector2.Multiply(velocity, 3),
        ModProjectile.getTypeByName('BloomingBowPro'),
        damage,
        knockBack,
        player.whoAmI,
        0, 0, 0, null
    );
    return false;
  }

AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("Petal"), 8)
      .AddTile(Terraria.ID.TileID.DyeVat)
      .Register();
  }
}