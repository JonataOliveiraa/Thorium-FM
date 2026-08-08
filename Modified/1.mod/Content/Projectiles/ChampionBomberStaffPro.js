import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Vector2, Color, Effects } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _popType = -1;

export class ChampionBomberStaffPro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 22;
    this.Projectile.height = 22;
    this.Projectile.aiStyle = -1;
    this.Projectile.magic = true;
    this.Projectile.friendly = true;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 120;
    this.Projectile.tileCollide = true;
  }

  OnHitNPC(proj, npc) {
    if (npc && npc.life <= 0) {
      const player = Terraria.Main.player[proj.owner];
      if (player && player.active) {
        player.HealMana(15);
      }
    }
  }

  AI(proj) {
    proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;

    const dustIdx = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 172, 0, 0, 0, Color.White, 1.25);
    const dust = Terraria.Main.dust[dustIdx];
    if (dust) {
      const vel = dust.velocity;
      vel.X *= 0.25;
      vel.Y *= 0.25;
      dust.velocity = vel;
      dust.noGravity = true;
    }
  }

  OnKill(proj, timeLeft) {
    try { Effects.PlaySound(14, Math.floor(proj.Center.X), Math.floor(proj.Center.Y)); } catch (_) { }

    if (_popType === -1) {
      _popType = ModProjectile.getTypeByName('BuriedMagicPopPro') ?? -2;
    }

    if (_popType > 0 && Terraria.Main.myPlayer === proj.owner) {
      const halfDamage = Math.floor(proj.damage * 0.5);
      const center = proj.Center;
      const speeds = [
        Vector2.new(0, 4),
        Vector2.new(4, 0),
        Vector2.new(0, -4),
        Vector2.new(-4, 0),
        Vector2.new(3, 3),
        Vector2.new(-3, -3),
        Vector2.new(3, -3),
        Vector2.new(-3, 3)
      ];

      for (let i = 0; i < speeds.length; i++) {
        NewProjectile(null, center, speeds[i], _popType, halfDamage, proj.knockBack, proj.owner, 0, 0, 0, null);
      }
    }
  }
}
