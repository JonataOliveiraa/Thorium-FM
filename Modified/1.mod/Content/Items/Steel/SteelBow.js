import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { AmmoHelper } from './../../../Common/AmmoHelper.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class SteelBow extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Steel/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.ranged = true;
    this.Item.noMelee = true
    this.Item.shoot = 1;
    this.Item.shootSpeed = 7;
    this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;

    this.SetWeaponValues(13, 0, 0);
    this.SetDefaultWeaponStyle(24, true);

    this.Item.value = Terraria.Item.buyPrice(0, 1, 25, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.UseSound = Terraria.ID.SoundID.Item5;
    this.Item.maxStack = 1
  }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const projType = AmmoHelper.Consume(player, item.useAmmo);
        if (projType <= 0) return false;

        NewProjectile(null, position, velocity, projType, damage, knockBack, player.whoAmI, 0, 0, 0, null);
        return false;
    }
}