import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
const { Vector2 } = Modules;

const TileCollision = Terraria.Collision['Vector2 TileCollision(Vector2 oldPosition, Vector2 oldVelocity, int Width, int Height, bool fallThrough, bool fall2, int gravDir, bool ignoreDoors, bool ignoreAetheriumPlatforms, bool hoik)'];

export class IceCubePro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 16;
    this.Projectile.height = 16;
    this.Projectile.aiStyle = 14;
    this.Projectile.friendly = true;
    this.Projectile.magic = true;
    this.Projectile.penetrate = 2;
    this.Projectile.timeLeft = 120;
  }

  OnHitNPC(proj, npc) {
    npc.AddBuff(44, 120, false);
  }

  PreAI(proj) {
    const maxSpeedX = 12;
    const maxSpeedY = 6;
    const bounceSpeedReduction = 0.8;

    let v = proj.velocity;
    v.Y += 0.3;

    if (v.X > maxSpeedX) v.X = maxSpeedX;
    if (v.X < -maxSpeedX) v.X = -maxSpeedX;
    if (v.Y < -maxSpeedY) v.Y = -maxSpeedY;

    const oldVX = v.X;
    const oldVY = v.Y;
    const collision = TileCollision(proj.position, v, proj.width, proj.height, true, true, 1, false, false, true);

    // onGround
    if (oldVY > 0 && collision.Y !== oldVY) {
      v.Y = 0;
    } else {
      v.Y = collision.Y;
    }

    proj.velocity = v;
    Terraria.Collision.StepUp(proj.position, proj.velocity, proj.width, proj.height, proj.stepSpeed, proj.gfxOffY, 1, false, 0);
    v = proj.velocity;

    if (collision.X !== oldVX) {
      v.X = -oldVX * bounceSpeedReduction;
    } else {
      v.X = collision.X;
    }

    proj.velocity = v;
    proj.rotation = 0;

    return false;
  }
}