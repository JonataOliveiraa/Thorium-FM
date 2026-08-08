import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModNPC } from '../../../../TL/ModNPC.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let fallenSwordType = -1;
let fallenBowType = -1;
let reflectedType = -1;
let initialized = false;

function initTypes() {
  if (initialized) return;
  initialized = true;
  fallenSwordType = ModNPC.getTypeByName('FallenChampion2');
  fallenBowType = ModNPC.getTypeByName('FallenChampion1');
  reflectedType = ModProjectile.getTypeByName('MagicalBurstReflectedPro');
}

export class MagicalBurst extends ModNPC {
  constructor() {
    super();
    this.Texture = 'NPCs/BossBuriedChampion/' + this.constructor.name;
    this.timer = 0;
  }

  SetStaticDefaults() {
    Terraria.Main.npcFrameCount[this.Type] = 1;
    Terraria.ID.NPCID.Sets.CantTakeLunchMoney[this.Type] = true;
    this.hideFromBestiary = true;
  }

  SetDefaults() {
    this.NPC.lifeMax = 5;
    this.NPC.damage = 60;
    this.NPC.width = 26;
    this.NPC.height = 26;
    this.NPC.aiStyle = -1;
    this.NPC.noGravity = true;
    this.NPC.noTileCollide = true;
    this.NPC.lavaImmune = true;
    this.NPC.knockBackResist = 0;
  }

  GetAlpha() { return Color.White; }
  CanBeHitByProjectile() { return false; }

  OnHitByPlayer(npc, player, item, damageDone) {
    initTypes();
    let nearest = null;
    let nearestDistance = Number.MAX_VALUE;
    const npcCenter = npc.Center;

    for (let i = 0; i < Terraria.Main.maxNPCs; i++) {
      const candidate = Terraria.Main.npc[i];
      if (!candidate || !candidate.active || (candidate.type !== fallenSwordType && candidate.type !== fallenBowType)) continue;
      const dx = candidate.Center.X - npcCenter.X;
      const dy = candidate.Center.Y - npcCenter.Y;
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) { nearest = candidate; nearestDistance = distance; }
    }
    if (!nearest || reflectedType < 0) return;

    const delta = Vector2.Subtract(nearest.Center, npcCenter);
    const velocity = Vector2.Multiply(Vector2.SafeNormalize(delta, Vector2.UnitY), 16);
    NewProjectile(npc.GetSpawnSource_ForProjectile(), npcCenter.X, npcCenter.Y, velocity.X, velocity.Y, reflectedType, 25, 0, 0, 0, 0, 0, null);
    npc.active = false;
  }

  AI(npc) {
    initTypes();
    this.timer++;
    if (this.timer === 1) {
      const npcCenter = npc.Center;
      const delta = Vector2.Subtract(Vector2.new(npc.ai[0], npc.ai[1]), npcCenter);
      npc.velocity = Vector2.Multiply(Vector2.SafeNormalize(delta, Vector2.Zero), 8);
    }
    if (this.timer >= 60) npc.active = false;
    const velocity = npc.velocity;
    npc.rotation = Math.atan2(velocity.Y, velocity.X) - Math.PI / 2;
    for (let i = 0; i < 2; i++) {
      const d = Terraria.Dust.NewDust(npc.position, npc.width, npc.height, i === 0 ? 113 : 173, 0, 0, 150, Color.White, 1.25);
      if (Terraria.Main.dust[d]) Terraria.Main.dust[d].noGravity = true;
    }
  }
}
