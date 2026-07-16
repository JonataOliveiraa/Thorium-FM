import { Terraria, Microsoft, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { Effects } from './../../TL/Modules/Effects.js';
import { Rand } from '../../TL/Modules/Rand.js';
import { ProjAI } from '../../TL/ProjAI.js'

const { Color, Vector2 } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const TileCollision = Terraria.Collision['Vector2 TileCollision(Vector2 oldPosition, Vector2 oldVelocity, int Width, int Height, bool fallThrough, bool fall2, int gravDir, bool ignoreDoors, bool ignoreAetheriumPlatforms, bool hoik)'];

export class SkywarePro extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
    this.collideMax = 2;
    this.fadeOutTime = 30;
    this.fadeOutSpeed = 9;
    this.DrawOffsetX = -5;
    this.DrawOriginOffsetY = -5;
    this.bounceSpeedReduction = 0.85;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Type] = 1;
    Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 5;
    Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
  }

  SetDefaults() {
    this.Projectile.width = 22;
    this.Projectile.height = 22;
    this.Projectile.aiStyle = 0;
    this.Projectile.scale = 1;
    this.Projectile.penetrate = -1;
    this.Projectile.timeLeft = 60;
    this.Projectile.friendly = true;
    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = false;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = -1;
    this.Projectile.alpha = 1;
    this.AIType = 14;
  }

  GetAlpha(proj, color) {
    const opacity = proj.Opacity;
    return Color.Multiply(Color.Multiply(Color.White, 0.8), opacity);
  }

  PreAI(proj) {
    const ai = new ProjAI(proj, false);
    const maxSpeed = 12;
    const bounceSpeedReduction = this.bounceSpeedReduction;

    proj.rotation += 0.25;
    const dustIdx = NewDust(Vector2.Subtract(proj.position, proj.velocity), proj.width, proj.height, 15, 0, 0, 100, Color.White, 1.0);
    const dust = Terraria.Main.dust[dustIdx];
    if (dust) {
      dust.velocity = Vector2.Multiply(dust.velocity, 0.3);
      dust.noGravity = true;
    }

    let v = proj.velocity;
    if (v.X > maxSpeed) v.X = maxSpeed;
    if (v.X < -maxSpeed) v.X = -maxSpeed;
    if (v.Y > maxSpeed) v.Y = maxSpeed;
    if (v.Y < -maxSpeed) v.Y = -maxSpeed;

    const oldVX = v.X;
    const oldVY = v.Y;
    const collision = TileCollision(proj.position, v, proj.width, proj.height, true, true, 1, false, false, true);

    const hitY = oldVY !== 0 && collision.Y !== oldVY;
    const hitX = oldVX !== 0 && collision.X !== oldVX;

    if (hitX || hitY) {
      const maxBounces = this.collideMax;

      if (hitX) {
        const direction = Math.sign(oldVX);
        v.X = -Math.abs(oldVX) * direction * bounceSpeedReduction;
      } else {
        v.X = collision.X;
      }

      if (hitY) {
        const direction = Math.sign(oldVY);
        v.Y = -Math.abs(oldVY) * direction * bounceSpeedReduction;
      } else {
        v.Y = collision.Y;
      }

      ai[0] = (ai[0] || 0) + 1;
      this.SpawnSecondaryProjectiles(proj)
      this.CreateBounceEffect(proj);
      Effects.PlaySound(Terraria.ID.SoundID.Item10, proj.position.X, proj.position.Y);
      if (ai[0] >= maxBounces) {
        proj.Kill();
        return false;
      }
    } else {
      v.X = collision.X;
      v.Y = collision.Y;
    }
    proj.velocity = v;
    if (!hitY) {
      Terraria.Collision.StepUp(proj.position, proj.velocity, proj.width, proj.height, proj.stepSpeed, proj.gfxOffY, 1, false, 0);
    }
    if (proj.timeLeft < this.fadeOutTime) {
      const fadeProgress = 1 - (proj.timeLeft / this.fadeOutTime);
      proj.Opacity = 1 - (fadeProgress * this.fadeOutSpeed / 10);
    }
    return false;
  }

  CreateBounceEffect(proj) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      const dustIdx = NewDust(proj.Center, 0, 0, 15, Math.cos(angle) * speed, Math.sin(angle) * speed, 100, Color.White, 0.8 + Math.random() * 0.6);
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) {
        dust.noGravity = true;
        dust.scale = 0.6 + Math.random() * 0.6;
      }
    }
    for (let i = 0; i < 4; i++) {
      const dustIdx = NewDust(proj.position, proj.width, proj.height, 15, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 100, Color.White, 1.0 + Math.random() * 0.5);
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) {
        dust.noGravity = true;
        dust.scale = 0.8 + Math.random() * 0.4;
      }
    }
  }

  OnHitNPC(proj, npc) {
    for (let i = 0; i < 4; i++) {
      const dustIdx = NewDust(npc.position, npc.width, npc.height, 15, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, 100, Color.White, 1.0 + Math.random() * 0.5);
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) dust.noGravity = true;
    }
    Effects.PlaySound(Terraria.ID.SoundID.Item25, proj.position.X, proj.position.Y);
  }

  OnKill(proj) {
    for (let i = 0; i < 15; i++) {
      const dustIdx = NewDust(proj.position, proj.width, proj.height, 15, Rand.Next(-4, 5), Rand.Next(-4, 5), 0, Color.White, 1.2);
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) {
        dust.noGravity = true;
        dust.scale = 0.8 + Math.random() * 0.8;
      }
    }
  }

  SpawnSecondaryProjectiles(proj) {
    const projectileType = ModProjectile.getTypeByName('SkywarePro2');
    const damage = Math.floor(proj.damage * 0.75);
    const knockBack = proj.knockBack * 0.75;

    for (let i = 0; i < 4; i++) {
      const velocity = Vector2.new(
        Rand.Next(-6, 7),
        Rand.Next(-6, 7)
      );

      NewProjectile(
        null,
        proj.Center,
        velocity,
        projectileType,
        damage,
        knockBack,
        proj.owner,
        0, 0, 0,
        null
      );
    }
  }

  PreDraw(proj) {
    const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
    const origin = Vector2.new(texture.Width * 0.5 + this.DrawOffsetX, texture.Height * 0.5 + this.DrawOriginOffsetY);
    const screenPos = Terraria.Main.screenPosition;
    const effects = Microsoft.Xna.Framework.Graphics.SpriteEffects.None;

    for (let k = proj.oldPos.Length - 1; k >= 0; k--) {
      const pos = proj.oldPos.get_Item(k);
      if (pos.X === 0 && pos.Y === 0) continue;
      const drawPos = Vector2.Add(Vector2.Subtract(pos, screenPos), origin);
      const alpha = 1.0 - (k / proj.oldPos.Length);
      const color = Color.Multiply(Color.White, alpha * 0.5 * proj.Opacity);
      const scale = 0.8 + alpha * 0.4;

      Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
        texture, drawPos, null, color, proj.rotation, origin, scale, effects, 0);
    }
    return true;
  }
}