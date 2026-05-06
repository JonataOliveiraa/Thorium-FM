import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModNPC } from './../../TL/ModNPC.js';
import { Rand } from '../../TL/Modules/Rand.js';

const { Main } = Terraria;
const { Color, Vector2 } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['void PlaySound(int type, Vector2 position, int style, float pitchOffset)'];

export class StormFlareP extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.projFrames[this.Type] = 4;
  }

  SetDefaults() {
    this.Projectile.width = 10;
    this.Projectile.height = 10;
    this.Projectile.aiStyle = 1;
    this.AIType = 1;
    this.Projectile.arrow = true;
    this.Projectile.friendly = true;
    this.Projectile.hostile = false;
    this.Projectile.ranged = true;
    this.Projectile.penetrate = 2;
    this.Projectile.timeLeft = 300;
    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = true;
    this.Projectile.extraUpdates = 1;
  }

  AI(proj) {
    proj.velocity.Y += 0.02; // gravidade extra (opcional)

    if (++proj.frameCounter >= 5) {
      proj.frameCounter = 0;
      if (++proj.frame >= 4) proj.frame = 0;
    }

    if (Rand.NextBool(3)) {
      let d1 = NewDust(proj.position, proj.width, proj.height + 5, 15,
        proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 100, Color.White, 1.6);
      if (d1 >= 0 && d1 < Main.dust.length) Main.dust[d1].noGravity = true;

      let d2 = NewDust(proj.position, proj.width, proj.height + 5, 57,
        proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 100, Color.White, 1.6);
      if (d2 >= 0 && d2 < Main.dust.length) Main.dust[d2].noGravity = true;
    }
  }

  OnTileCollide(proj, oldVelocity) {
    PlaySound(10, proj.Center, 0, 1);
    let d = NewDust(proj.position, proj.width, proj.height, 15,
      proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 100, Color.White, 1.3);
    if (d >= 0 && d < Main.dust.length) Main.dust[d].noGravity = true;
    return true;
  }

  OnKill(proj, timeLeft) {
    if (Main.myPlayer !== proj.owner) return;

    const bossType = ModNPC.getTypeByName('TheGrandThunderBird');
    const player = Main.player[proj.owner];
    const spawnX = Math.floor(proj.Center.X);
    const spawnY = Math.floor(proj.Center.Y - 600);

    Terraria.NPC.NewNPC(
      Terraria.Projectile.GetNoneSource(),
      spawnX, spawnY, bossType,
      0, 0, 0, 0, 0,
      player.whoAmI
    );
  }
}