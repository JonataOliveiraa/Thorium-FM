import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const Projectile = new NativeClass("Terraria", "Projectile");
const NewProjectile2 = Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class TalonBurst extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/ThunderBird/' + this.constructor.name;
  }

  SetDefaults() {
    // Hitbox
    this.Item.width = 30;
    this.Item.height = 30;

    // Weapon Damage
    this.Item.ranged = true;
    this.Item.noMelee = true;
    this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;
    this.Item.shoot = 1;
    this.Item.shootSpeed = 20;
    this.SetWeaponValues(10, 1, 0);
    this.SetDefaultWeaponStyle(25, true);
    this.Item.useStyle = 5;

    // Other
    this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.UseSound = Terraria.ID.SoundID.Item5;
  }

  Shoot(item, player, position, velocity, type, damage, knockback) {
    let finalType = type;
    if (type === 1) {
      finalType = ModProjectile.getTypeByName("TalonBurstPro");
    }
    try {
      NewProjectile2(Projectile.GetNoneSource(), position, velocity, finalType, damage, knockback, player.whoAmI, 0, 0, 0, null);
    } catch (e) { }
    return false;
  }
}