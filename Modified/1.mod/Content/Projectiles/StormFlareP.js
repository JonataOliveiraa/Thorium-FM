import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModNPC } from './../../TL/ModNPC.js';
const { Effects } = Modules
export class StormFlareP extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 30;
    this.Projectile.height = 30;
    this.Projectile.scale = 1;
    this.Projectile.aiStyle = -1;
    this.Projectile.friendly = true;
    this.Projectile.hostile = false;
    this.Projectile.ranged = true;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 30;
    this.Projectile.light = 0.5;
    this.Projectile.alpha = 255;
    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = true;
    this.Projectile.extraUpdates = 1;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = -1;
  }

  AI(proj) {
    proj.velocity.Y += 0.2;
    proj.rotation += proj.velocity.X * 0.1;
    let d = Terraria.Dust.NewDustDirect(proj.position, proj.width, proj.height, 6, 0, 0, 100, null, 1.5);
    if (d) d.noGravity = true;
  }
  OnKill(proj) {
    const bossType = ModNPC.getTypeByName('TheGrandThunderBird');
    const player = Terraria.Main.myPlayer
    const spawnX = Math.floor(proj.Center.X);
    const spawnY = Math.floor(proj.Center.Y - 600);
    Terraria.NPC.NewNPC(Terraria.Projectile.GetNoneSource(), spawnX, spawnY, bossType, 0, 0, 0, 0, 0, player.whoAmI)
  }
}