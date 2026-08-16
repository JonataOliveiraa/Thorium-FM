import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModNPC } from '../../../../TL/ModNPC.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';

const { Color, Vector2, Effects } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let _buriedArrowType = -1;
let _buriedChampionType = -1;
let _magicalBurstReflectedType = -1;
let _typesInit = false;

function initTypes() {
  if (_typesInit) return;
  _typesInit = true;
  _buriedArrowType = ModProjectile.getTypeByName('BuriedArrow');
  _buriedChampionType = ModNPC.getTypeByName('BuriedChampion');
  _magicalBurstReflectedType = ModProjectile.getTypeByName('MagicalBurstReflectedPro');
}

function clamp(val, min, max) {
  return val < min ? min : (val > max ? max : val);
}

export class FallenChampion1 extends ModNPC {
  constructor() {
    super();
    this.Texture = 'NPCs/Boss/BossBuriedChampion/' + this.constructor.name;
    this.counter = 0;
    this.flux = 0;
    this.shift = false;
    this.sideRight = false;
    this.attackState = 1;
  }

  SetStaticDefaults() {
    Terraria.Main.npcFrameCount[this.Type] = 14;
    Terraria.ID.NPCID.Sets.CantTakeLunchMoney[this.Type] = true;
    this.hideFromBestiary = true;
  }

  SetDefaults() {
    this.NPC.lifeMax = 2;
    this.NPC.damage = 35;
    this.NPC.knockBackResist = 0.0;
    this.NPC.noTileCollide = true;
    this.NPC.lavaImmune = true;
    this.NPC.width = 46;
    this.NPC.height = 60;
    this.NPC.aiStyle = -1;
    this.NPC.noGravity = true;
    this.NPC.alpha = 125;
    this.NPC.HitSound = Terraria.ID.SoundID.NPCHit52;
    this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath55;
  }

  GetAlpha(npc, drawColor) {
    return npc.life < npc.lifeMax ? Color.new(255, 100, 100, 50) : Color.new(255, 255, 255, 100);
  }

  OnHitByProjectile(npc, projectile) {
    if (_magicalBurstReflectedType >= 0 && projectile.type === _magicalBurstReflectedType) {
      npc.life = Math.max(0, npc.life - 1);
      if (npc.life <= 0) {
        npc.checkDead();
      }
    }
  }

  FindFrame(npc, frameHeight) {
    const frame = npc.frame;
    npc.frameCounter += 1;
    if (npc.frameCounter > 6) {
      this.counter++;
      if (this.counter >= 8) this.counter = 4;
      npc.frameCounter = 0;
    }
    frame.Y = this.counter * frameHeight;
    npc.frame = frame;
  }

  CheckActive() {
    return false;
  }

  AI(npc) {
    initTypes();

    npc.ai[0]++;
    npc.ai[2]++;
    npc.ai[3]++;

    if (_buriedChampionType >= 0 && Terraria.NPC.CountNPCS(_buriedChampionType) === 0) {
      npc.life = 0;
      npc.active = false;
      return;
    }

    npc.TargetClosest(true);
    const player = Terraria.Main.player[npc.target];
    if (!player || !player.active || player.dead) {
      const retreatVelocity = npc.velocity;
      retreatVelocity.Y -= 0.2;
      npc.velocity = retreatVelocity;
      if (npc.timeLeft > 10) npc.timeLeft = 10;
      return;
    }

    const npcCenter = npc.Center;
    const playerCenter = player.Center;

    this.attackState = 1;

    if (npc.ai[0] >= 120) {
      try { Effects.PlaySound(Terraria.ID.SoundID.Item5, npcCenter.X, npcCenter.Y); } catch (_) { }
      if (_buriedArrowType >= 0) {
        const dx = playerCenter.X - npcCenter.X;
        const dy = playerCenter.Y - npcCenter.Y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 9;
        NewProjectile(
          null,
          npcCenter.X, npcCenter.Y,
          (dx / len) * speed, (dy / len) * speed,
          _buriedArrowType, 10, 0, npc.target, 0, 0, 0, null
        );
      }
      npc.ai[0] = 0;
    }

    if (npc.ai[2] >= 300) {
      this.sideRight = !this.sideRight;
      const side = this.sideRight ? 1 : -1;
      const targetPos = Vector2.new(playerCenter.X + side * 350, playerCenter.Y - 150);
      const dirVec = Vector2.SafeNormalize(Vector2.Subtract(targetPos, npcCenter), Vector2.Zero);
      npc.velocity = Vector2.Multiply(dirVec, 16);
      npc.ai[2] = -120;
    }

    const dx = playerCenter.X - npcCenter.X;
    npc.spriteDirection = dx > 0 ? 1 : -1;
    this.flux += this.shift ? -1.4 : 1.4;
    if (this.flux >= 60) this.shift = true;
    else if (this.flux <= -60) this.shift = false;

    const distAbsX = Math.abs(dx);
    let targetX = playerCenter.X;
    if (distAbsX <= 500) {
      const side = this.sideRight ? 1 : -1;
      targetX = playerCenter.X + side * 350;
    }
    const targetY = playerCenter.Y - 175 + this.flux;
    const velocity = npc.velocity;
    const desiredX = clamp((targetX - npcCenter.X) * 0.04, -8, 8);
    const desiredY = clamp((targetY - npcCenter.Y) * 0.05, -7, 7);
    velocity.X += (desiredX - velocity.X) * 0.1;
    velocity.Y += (desiredY - velocity.Y) * 0.12;
    npc.velocity = velocity;
  }

  HitEffect(npc, hitDirection) {
    if (npc.life <= 0) {
      for (let i = 0; i < 50; i++) {
        Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 113, Math.random() * 12 - 6, Math.random() * 12 - 6, 0, Color.White, 2.0);
        Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 173, Math.random() * 12 - 6, Math.random() * 12 - 6, 0, Color.White, 1.25);
      }
    } else {
      for (let i = 0; i < 10; i++) {
        Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 113, hitDirection, -1, 0, Color.White, 1.0);
      }
    }
  }
}
