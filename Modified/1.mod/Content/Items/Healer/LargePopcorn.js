import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Rand, Vector2 } = Modules;
const { Main } = Terraria;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class LargePopcorn extends ModHealerItem {
  constructor() {
    super();
    this.Texture = 'Items/Healer/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.ID.ItemID.Sets.IsFood[this.Type] = false;
  }

  SetDefaults() {
    this.Item.damage = 0;
    this.Item.mana = 10;
    this.Item.width = 20;
    this.Item.height = 20;
    this.Item.useTime = 30;
    this.Item.useAnimation = 30;
    this.Item.useStyle = 1;
    this.Item.noMelee = true;
    this.Item.autoReuse = true;
    this.Item.maxStack = 1;
    this.Item.consumable = false;
    this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
    this.Item.rare = 2;
    this.Item.UseSound = Terraria.ID.SoundID.Item19;
    this.Item.shoot = ModProjectile.getTypeByName('PopcornPro');
    this.Item.shootSpeed = 7;
  }

  Shoot(item, player, position, velocity, type, damage, knockBack) {
    if (!(type > 0)) return false;

    const owned = [];
    for (let i = 0; i < Main.maxProjectiles; i++) {
      const proj = Main.projectile[i];
      if (!proj || proj.type !== type || !proj.active || proj.owner !== player.whoAmI) continue;
      owned.push(proj);
    }

    while (owned.length + 2 > 6) {
      let oldestIndex = 0;
      for (let i = 1; i < owned.length; i++) {
        if (owned[i].timeLeft < owned[oldestIndex].timeLeft) oldestIndex = i;
      }
      owned[oldestIndex].Kill();
      owned.splice(oldestIndex, 1);
    }

    for (let i = 0; i < 2; i++) {
      const angle = (Rand.NextFloat() - 0.5) * 0.8727;
      const speed = 1 - Rand.NextFloat() * 0.3;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const frame = Rand.NextFloat() < 0.8 ? Rand.Next(0, 4) : 4 + Rand.Next(0, 2);

      NewProjectile(
        null,
        position,
        Vector2.new(
          (velocity.X * cos - velocity.Y * sin) * speed,
          (velocity.X * sin + velocity.Y * cos) * speed
        ),
        type, 0, knockBack, player.whoAmI, 0, frame, 0, null
      );
    }

    return false;
  }
}
