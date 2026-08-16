import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModNPC } from '../../../../TL/ModNPC.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
let championType = -1;
let shockType = -1;
let reflectedType = -1;
let initialized = false;

function initTypes() {
  if (initialized) return;
  initialized = true;
  championType = ModNPC.getTypeByName('BuriedChampion');
  shockType = ModProjectile.getTypeByName('BuriedShock');
  reflectedType = ModProjectile.getTypeByName('MagicalBurstReflectedPro');
}

function clamp(val, min, max) {
  return val < min ? min : (val > max ? max : val);
}

export class FallenChampion2 extends ModNPC {
  constructor() {
    super();
    this.Texture = 'NPCs/Boss/BossBuriedChampion/' + this.constructor.name;
    this.counter = 0;
    this.flux = 0;
    this.shift = false;
    this.sideRight = false;
    this.strike = false;
    this.charge = false;
    this.charging = false;
  }

  SetStaticDefaults() {
    Terraria.Main.npcFrameCount[this.Type] = 14;
    Terraria.ID.NPCID.Sets.CantTakeLunchMoney[this.Type] = true;
    this.hideFromBestiary = true;
  }

  SetDefaults() {
    this.NPC.lifeMax = 2;
    this.NPC.damage = 35;
    this.NPC.defense = 999;
    this.NPC.knockBackResist = 0;
    this.NPC.noTileCollide = true;
    this.NPC.noGravity = true;
    this.NPC.lavaImmune = true;
    this.NPC.width = 46;
    this.NPC.height = 60;
    this.NPC.aiStyle = -1;
    this.NPC.alpha = 125;
    this.NPC.friendly = true;
    this.NPC.dontTakeDamageFromHostiles = true;
    this.NPC.chaseable = false;
    this.NPC.HitSound = Terraria.ID.SoundID.NPCHit52;
    this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath55;
  }

  GetAlpha(npc, drawColor) {
    return npc.life < npc.lifeMax ? Color.new(255, 100, 100, 75) : Color.new(255, 255, 255, 100);
  }

  OnHitByProjectile(npc, projectile) {
    if (projectile.type === reflectedType) {
      npc.life = Math.max(0, npc.life - 1);
      if (npc.life <= 0) npc.checkDead();
    }
  }

  FindFrame(npc, frameHeight) {
    if (this.strike) {
      npc.frameCounter++;
      if (npc.frameCounter > 6) {
        this.counter++;
        if (this.counter >= 14) { this.strike = false; this.counter = 0; }
        npc.frameCounter = 0;
      }
    } else if (this.charge) {
      this.counter = 13;
    } else {
      npc.frameCounter++;
      if (npc.frameCounter > 4) {
        this.counter = (this.counter + 1) % 4;
        npc.frameCounter = 0;
      }
    }
    const frame = npc.frame;
    frame.Y = this.counter * frameHeight;
    npc.frame = frame;
  }

  CheckActive() { return false; }

  AI(npc) {
    initTypes();
    npc.ai[0]++; npc.ai[2]++; npc.ai[3]++;

    if (championType >= 0 && Terraria.NPC.CountNPCS(championType) === 0) { npc.active = false; return; }

    npc.TargetClosest(true);
    const player = Terraria.Main.player[npc.target];
    if (!player || !player.active || player.dead) { if (npc.timeLeft > 10) npc.timeLeft = 10; return; }

    const npcCenter = npc.Center;
    const playerCenter = player.Center;

    if (npc.ai[3] === 110) { this.counter = 12; this.strike = true; }
    if (npc.ai[3] >= 180) {
      if (shockType >= 0) {
        const dx = playerCenter.X - npcCenter.X;
        const dy = playerCenter.Y - npcCenter.Y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 10;
        NewProjectile(null, npcCenter.X, npcCenter.Y, (dx / len) * speed, (dy / len) * speed, shockType, 10, 0, npc.target, 0, 0, 0, null);
      }
      npc.ai[3] = 0;
    }
    if (npc.ai[2] >= 360) { npc.ai[3] = 0; this.charge = true; this.charging = true; }
    if (npc.ai[2] >= 420) {
      this.sideRight = !this.sideRight;
      const targetPos = Vector2.new(playerCenter.X, playerCenter.Y + 35);
      const dirVec = Vector2.SafeNormalize(Vector2.Subtract(targetPos, npcCenter), Vector2.Zero);
      npc.velocity = Vector2.Multiply(dirVec, 14);
      npc.ai[2] = 0;
    }

    const dx = playerCenter.X - npcCenter.X;
    npc.spriteDirection = dx > 0 ? 1 : -1;

    this.flux += this.shift ? -1.4 : 1.4;
    if (this.flux >= 60) this.shift = true;
    else if (this.flux <= -60) this.shift = false;

    const vel = npc.velocity;
    if (!this.charging) {
      this.charge = false;
      const side = this.sideRight ? 1 : -1;
      const targetX = playerCenter.X + side * 350;
      const targetY = playerCenter.Y - 175 + this.flux;

      const desiredX = clamp((targetX - npcCenter.X) * 0.035, -7, 7);
      const desiredY = clamp((targetY - npcCenter.Y) * 0.045, -8, 8);

      vel.X += (desiredX - vel.X) * 0.09;
      vel.Y += (desiredY - vel.Y) * 0.12;
    } else {
      if (Math.abs(dx) > 250) {
        this.charging = false;
      }
    }
    npc.velocity = vel;
  }

  HitEffect(npc, hitDirection) {
    const count = npc.life <= 0 ? 50 : 10;
    for (let i = 0; i < count; i++) Terraria.Dust.NewDust(npc.position, npc.width, npc.height, i % 2 ? 173 : 113, Math.random() * 12 - 6, Math.random() * 12 - 6, 0, Color.White, i % 2 ? 1.25 : 2);
  }
}
