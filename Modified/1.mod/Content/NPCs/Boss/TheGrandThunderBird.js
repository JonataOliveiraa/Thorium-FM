import { Terraria, Microsoft, Modules } from './../../../TL/ModImports.js';
import { WorldDB } from './../../../TL/WorldDB.js';
import { ModNPC } from './../../../TL/ModNPC.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';
import { ModGore } from './../../../TL/ModGore.js';
import { ModProjectile } from './../../../TL/ModProjectile.js'

const { Color, Vector2, Rand, Effects } = Modules;
const { ItemDropRule, LeadingConditionRule, Conditions } = Terraria.GameContent.ItemDropRules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement, MoonLordPortraitBackgroundProviderBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewGore = Terraria.Gore['int NewGore(Vector2 Position, Vector2 Velocity, int Type, float Scale)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const OneFromRulesRule = new NativeClass('Terraria.GameContent.ItemDropRules', 'OneFromRulesRule');
const IItemDropRule = new NativeClass('Terraria.GameContent.ItemDropRules', 'IItemDropRule');

export class TheGrandThunderBird extends ModNPC {
  constructor() {
    super();
    this.Texture = 'NPCs/Boss/' + this.constructor.name;

    this.AttackState = 0;
    this.AttackStateTimer = 0;
    this.AttackOptions = [0, 1, 2];
    this.ChargeDecide = 0;
    this.ChargeTimer = 0;
    this.Frenzy = 0;

    this.PlayScreech = false;
    this.PlayCharge = false
    this.isDashing = false

    this.Animation = {
      Base: 0,
      Screech: 1,
      Stunned: 2,
      Charging: 3
    };
    this.AnimationState = this.Animation.Base;

    this.Attack = {
      LightningStrikes: 0,
      Charge: 1,
      Hatchling: 2,
      SparkShot: 3
    };

    this.Move = {
      accelX: 0.1,
      accelYSlow: 0.07,
      accelYFast: 0.8,
      maxSpeedX: 4,
      maxSpeedXFar: 6,
      rotationFactor: 0.05
    };

  }

  SetStaticDefaults() {
    Terraria.ID.NPCID.Sets.TrailCacheLength[this.Type] = 10;
    Terraria.ID.NPCID.Sets.TrailingMode[this.Type] = 0;
    Terraria.Main.npcFrameCount[this.Type] = 9;
    Terraria.ID.NPCID.Sets.MPAllowedEnemies[this.Type] = true;
    Terraria.ID.NPCID.Sets.BossBestiaryPriority.Add(this.Type);
    this.BestiaryRarityStars = 3;
    this.Music = Terraria.ID.MusicID.Boss2;
  }

  SetDefaults() {
    this.NPC.width = 90;
    this.NPC.height = 60;
    this.NPC.aiStyle = -1;
    this.NPC.damage = 40;
    this.NPC.defense = 6;
    this.NPC.lifeMax = 1500;
    this.NPC.knockBackResist = 0.0;
    this.NPC.noGravity = true;
    this.NPC.noTileCollide = true;
    this.NPC.boss = true;
    this.NPC.npcSlots = 20;
    this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
    this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath31;
    this.NPC.value = ModNPC.NPCValue(0, 0, 50, 0);
  }

  SetBestiary(database, bestiaryEntry) {
    bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Desert)
    const FlavorText = FlavorTextBestiaryInfoElement.new();
    FlavorText._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
    bestiaryEntry.Info.Add(FlavorText);
  }

  ModifyNPCLoot(npcLoot) {
    // Every Mode
    npcLoot.Add(ItemDropRule.Common(28, 1, 5, 15))

    // Classic Mode
    const notExpert = Conditions.NotExpert.new();
    const options = [
      ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('TalonBurst'), 1, 1, 1, 1),
      ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('StormHatchlingStaff'), 1, 1, 1, 1),
      ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('ThunderTalon'), 1, 1, 1, 1)
    ].makeGeneric(IItemDropRule)

    const oneDropRule = OneFromRulesRule.new();
    oneDropRule['void .ctor(int chanceDenominator, IItemDropRule[] options)'](1, options);
    npcLoot.Add(oneDropRule);

    npcLoot.Add(ItemDropRule.BossBag(ModItem.getTypeByName('ThunderBirdBag')))
  }

  BossHeadSlot(npc) {
    if (npc.ai[0] == 1) return 1 + Terraria.ID.NPCID.Sets.BossHeadTextures[npc.type];
    return null;
  }

  FindFrame(npc, frameHeight) {
    const frame = npc.frame;

    if (this.AnimationState === this.Animation.Screech) {
      frame.Y = 6 * frameHeight;
      npc.frame = frame;
      return;
    }
    if (this.AnimationState === this.Animation.Stunned) {
      frame.Y = 7 * frameHeight;
      npc.frame = frame;
      return;
    }
    if (this.AnimationState === this.Animation.Charging) {
      frame.Y = 8 * frameHeight;
      npc.frame = frame;
      return;
    }

    npc.frameCounter += 1;
    const frameSpeed = 6;
    if (npc.frameCounter > frameSpeed) {
      frame.Y += frameHeight;
      if (frame.Y > 4 * frameHeight) frame.Y = 0;
      npc.frameCounter = 0;
    }
    npc.frame = frame;

  }

  PreDraw(npc, spriteBatch, screenPos) {
    const texture = Terraria.GameContent.TextureAssets.Npc[this.Type].Value;
    const frame = npc.frame;

    const origin = Vector2.new(frame.Width / 2, frame.Height / 2);

    const effects = npc.spriteDirection === 1
      ? Microsoft.Xna.Framework.Graphics.SpriteEffects.FlipHorizontally
      : Microsoft.Xna.Framework.Graphics.SpriteEffects.None;

    // trail    
    if (this.isDashing) {
      for (let i = npc.oldPos.length - 1; i >= 0; i--) {
        const pos = npc.oldPos[i];
        if (pos.X === 0 && pos.Y === 0) continue;

        let drawPos = Vector2.Subtract(pos, Terraria.Main.screenPosition);
        drawPos = Vector2.Add(drawPos, npc.gfxOffY);
        drawPos = Vector2.Add(drawPos, Vector2.new(npc.width / 2, npc.height / 2 - 30));

        const alpha = (npc.oldPos.length - i) / npc.oldPos.length;
        const color = Color.op_Multiply(Color.Cyan, alpha * 0.4);

        Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
          texture, drawPos, frame, color, npc.rotation, origin, npc.scale, effects, 0
        );
      }
    }
    return true

  }

  PreAI(npc) {
    npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
    return true;
  }

  // Não tente entender, pfvr...
  AI(npc) {
    // Target
    let player = Terraria.Main.player[npc.target];
    if (npc.target < 0 || npc.target == 255 || player.dead || !player.active) {
      npc.TargetClosest(true);
      player = Terraria.Main.player[npc.target];
    }

    // Despawn    
    if (player.dead) {
      let vel = npc.velocity;
      vel.Y -= 0.4;
      npc.velocity = vel;
      npc.EncourageDespawn(10);
      return;
    }

    let vel = npc.velocity;
    const move = this.Move;

    // Phase    
    const Phase2 = npc.life <= npc.lifeMax * 0.33;
    const heightOffset = (Terraria.Main.expertMode && Phase2) ? 225 : 265;

    const isDashing = this.AttackState === this.Attack.Charge && this.AttackStateTimer > 300 && this.AttackStateTimer < 390;
    this.isDashing = isDashing;
    if (!isDashing) npc.spriteDirection = (player.Center.X > npc.Center.X) ? 1 : -1;

    if (Phase2) {
      this.Frenzy = 60;
      if (!this.AttackOptions.includes(3)) this.AttackOptions.push(3);
    } else {
      if (this.AttackOptions.includes(3)) {
        this.AttackOptions = this.AttackOptions.filter(a => a !== 3);
      }
      if (npc.life < npc.lifeMax * 0.66) this.Frenzy = 30;
    }

    // Stunned    
    if (this.AnimationState === this.Animation.Stunned) {
      vel.X = 0;
      vel.Y = 0;
      this.ChargeDecide = 0;

      if (this.AttackStateTimer < -90) {
        npc.velocity = vel;
        return;
      }
      if (this.AttackStateTimer === -90) {
        vel.Y = -10;
        vel.X = 0;
        this.ChargeDecide = 0;
        this.DecideNewAttack(npc, 0);
      }
    }

    if (
      (this.AnimationState === this.Animation.Base && this.AttackState !== this.Attack.Charge) ||
      (this.AttackState === this.Attack.Charge && this.AttackStateTimer < 60)
    ) {
      if (player.Center.Y < npc.Center.Y + heightOffset) {
        vel.Y -= (vel.Y > 0) ? move.accelYFast : move.accelYSlow;
      }
      if (player.Center.Y > npc.Center.Y + heightOffset) {
        vel.Y += (vel.Y < 0) ? move.accelYFast : move.accelYSlow;
      }

      npc.rotation = vel.X * move.rotationFactor;

      if (player.Center.X < npc.Center.X && vel.X > -move.maxSpeedX) {
        vel.X -= move.accelX;

        if (vel.X > move.maxSpeedX) vel.X -= move.accelX;
        else if (vel.X > 0) vel.X += move.accelX * 0.5;

        if (vel.X < -move.maxSpeedX) vel.X = -move.maxSpeedX;
      }
      else if (player.Center.X > npc.Center.X && vel.X < move.maxSpeedX) {
        vel.X += move.accelX;

        if (vel.X < -move.maxSpeedX) vel.X += move.accelX;
        else if (vel.X < 0) vel.X -= move.accelX * 0.5;

        if (vel.X > move.maxSpeedX) vel.X = move.maxSpeedX;
      }
    }

    if (this.AttackState !== this.Attack.Charge) {
      if (player.Center.X + 850 < npc.Center.X) {
        vel.X = vel.X < 0 ? -move.maxSpeedXFar : -move.maxSpeedX;
      }
      if (player.Center.X - 850 > npc.Center.X) {
        vel.X = vel.X < 0 ? move.maxSpeedXFar : move.maxSpeedX;
      }
    }

    // PlaySound        
    if (this.AnimationState === this.Animation.Screech && !this.PlayScreech) {
      this.PlayScreech = true;
      const pitch = Phase2 ? Rand.NextFloat(-0.4, -0.1) : Rand.NextFloat(-0.2, 0.2);
      Effects.PlaySound(Terraria.ID.SoundID.NPCHit28, npc.Center.X, npc.Center.Y, 1, pitch, 1);
    }

    // ==== LIGHTNING STRIKES =====    
    if (this.AttackState === this.Attack.LightningStrikes) {
      this.AttackStateTimer++;

      if (this.AttackStateTimer >= 60) {
        vel.X = (npc.spriteDirection === 1) ? 0.01 : -0.01;
        vel.Y = 0;
      }

      if (this.AttackStateTimer === 60) {
        this.AnimationState = this.Animation.Screech;

        const Zap = ModProjectile.getTypeByName("GrandThunderBirdZap");

        for (let i = 0; i < 8; i++) {
          NewProjectile(
            Terraria.Projectile.GetNoneSource(),
            player.Center.X + Rand.Next(-200, 200),
            player.Center.Y - 800 + Rand.Next(-30, 30),
            0, 10, Zap, 12, 0,
            Terraria.Main.myPlayer, 0, 0, 0, null
          );
        }

        for (let i = 0; i < 20; i++) {
          const d = Effects.NewDust(npc.Center, npc.width / 2, npc.height / 2, 15, 0, -3, 150, Color.White, 1.5);
          const dust = Terraria.Main.dust[d];
          dust.noGravity = true;
          dust.velocity = Vector2.Multiply(dust.velocity, 0.5);
        }
      }

      if (this.AttackStateTimer >= 120) {
        this.DecideNewAttack(npc, 0);
      }
    }

    // ==== CHARGE ====    
    if (this.AttackState === this.Attack.Charge) {
      this.AttackStateTimer++;
      npc.rotation = 0;

      const speed = 5;

      if (this.AttackStateTimer === 90 && this.ChargeDecide === 0) {
        this.ChargeDecide = (player.Center.X < npc.Center.X) ? 1 : 2;
      }

      if (this.AttackStateTimer > 120 && this.AttackStateTimer < 300) {
        const dir = (this.ChargeDecide === 1) ? -1 : 1;

        npc.direction = dir;
        npc.spriteDirection = dir;

        const target = Vector2.Add(player.Center, Vector2.new(-dir * 400, 0));
        const moveVec = Vector2.Subtract(target, npc.Center);

        if (Vector2.DistanceSquared(target, npc.Center) > 400) {
          const dashDir = Vector2.SafeNormalize(moveVec, Vector2.UnitX);
          vel = Vector2.Multiply(dashDir, speed);
        } else {
          npc.Center = target;
        }
      }

      if (this.AttackStateTimer > 120 && this.AttackStateTimer < 300) {
        for (let i = 0; i < 6; i++) {
          const angle = Rand.NextFloat(0, Math.PI * 2);
          const radius = Rand.NextFloat(60, 120);
          const offset = Vector2.RotatedBy(Vector2.new(radius, 0), angle);
          const spawnPos = Vector2.Add(npc.Center, offset);
          const d = Effects.NewDust(spawnPos, 0, 0, 228, 0, 0, 0, Color.White, 1.2);
          const dust = Terraria.Main.dust[d];
          dust.noGravity = true;
          const toCenter = Vector2.Subtract(npc.Center, dust.position);
          const dir = Vector2.SafeNormalize(toCenter, Vector2.Zero);
          dust.velocity = Vector2.Multiply(dir, Rand.NextFloat(3, 6));
          dust.velocity = Vector2.RotatedBy(dust.velocity, Rand.NextFloat(-0.3, 0.3));
        }
      }

      // Play Charge EFX    
      if (this.AttackStateTimer > 300 && !this.PlayCharge) {
        this.PlayCharge = true
        const soundPos = Vector2.Multiply(Vector2.Add(npc.Center, player.Center), 0.5);
        Effects.PlaySound(43, soundPos.X, soundPos.Y, 1, 0.2, 1.2);
        const dir = Vector2.RotatedBy(Vector2.UnitX, Rand.NextFloat(0, Math.PI * 2));
        const speed = Rand.NextFloat(4, 12);
        const d = Effects.NewDust(npc.Center, 0, 0, 228, 0, 0, 0, Color.White, 1.5);
        const dust = Terraria.Main.dust[d];
        dust.noGravity = true;
        dust.velocity = Vector2.Multiply(dir, speed);
        dust.scale = 2
      }

      if (this.AttackStateTimer > 300) {
        const dir = (this.ChargeDecide === 1) ? -1 : 1;

        this.AnimationState = this.Animation.Charging;
        vel.Y = 0;
        vel.X = dir * 14;

        if (Rand.Next(2) === 0) {
          const d3 = Effects.NewDust(npc.Center, npc.width / 2, npc.height / 2, 15, -vel.X * 0.2, 0, 150, Color.White, 1.3);
          const dust3 = Terraria.Main.dust[d3];
          dust3.noGravity = true;
        }
      }

      if (this.AttackStateTimer > 390) {
        this.ChargeDecide = 0;
        this.DecideNewAttack(npc, 0);
      }
    }

    // ==== HATCHLING ====    
    if (this.AttackState === this.Attack.Hatchling) {
      this.AttackStateTimer++;

      if (this.AttackStateTimer === 120) {
        if (!player.dead) {
          for (let i = 0; i < 3; i++) {
            Terraria.NPC.NewNPC(
              Terraria.NPC.GetSpawnSourceForNPCFromNPCAI(npc),
              npc.Center.X + Rand.Next(-40, 40),
              npc.Center.Y + Rand.Next(-40, 40),
              ModNPC.getTypeByName("StormHatchling"),
              0, 0, 0, 0, 0, player.whoAmI
            );
          }
        }
        for (let i = 0; i < 25; i++) {
          const d4 = Effects.NewDust(npc.Center, npc.width / 2, npc.height / 2, 15, Rand.Next(-5, 5), Rand.Next(-5, 5), 150, Color.White, 1.4);
          Terraria.Main.dust[d4].noGravity = true;
        }
      }
      if (this.AttackStateTimer >= 180) {
        this.DecideNewAttack(npc, 0);
      }
    }

    // ===== SPARK SHOT CLOUD =====    
    if (this.AttackState === this.Attack.SparkShot) {
      this.AttackStateTimer++;
      vel.X *= 0.9;
      vel.Y *= 0.9;
      if (this.AttackStateTimer === 1) {
        this.AnimationState = this.Animation.Screech;
      }
      if (this.AttackStateTimer === 60) {
        const Cloud = ModProjectile.getTypeByName("GrandThunderBirdCloud");
        for (let i = 0; i < 4; i++) {
          NewProjectile(Terraria.Projectile.GetNoneSource(), player.Center.X + Rand.Next(-200, 200), player.Center.Y + Rand.Next(-150, -100), 0, 0, Cloud, 0, 0, Terraria.Main.myPlayer, 0, 0, 0, null);
        }
      }
      if (this.AttackStateTimer >= 120) {
        this.DecideNewAttack(npc, 0);
      }
    }

    if (Rand.Next(3) === 0) {
      const d1 = Effects.NewDust(npc.Center, npc.width / 2, npc.height / 2, 15, vel.X * 0.2, vel.Y * 0.2, 150, Color.White, 1.2);
      const dust1 = Terraria.Main.dust[d1];
      dust1.noGravity = true;
      dust1.velocity = Vector2.Multiply(dust1.velocity, 0.3);
    }
    npc.velocity = vel;

  }

  // Next Attack Decider
  DecideNewAttack(npc, frame = 0, ...attackStatesToIgnore) {
    this.PlayScreech = false
    this.PlayCharge = false

    this.AnimationState = this.Animation.Base;
    this.AttackStateTimer = this.Frenzy - 90;
    this.ChargeTimer += 1;
    npc.TargetClosest(true)

    const list = [...this.AttackOptions];
    if (!attackStatesToIgnore || attackStatesToIgnore.length === 0) {
      attackStatesToIgnore = [this.AttackState];
    }

    for (const ignore of attackStatesToIgnore) {
      const index = list.indexOf(ignore);
      if (index !== -1) {
        list.splice(index, 1);
      }
    }
    if (list.length === 0) list.push(0);
    this.AttackState = list[Math.floor(Math.random() * list.length)];

  }

  OnKill(npc) {
    WorldDB.set('Thorium:HasBeenDefeated_TheGrandThunderBird', true)
    NewProjectile(Terraria.Projectile.GetNoneSource(), npc.Center.X, npc.Center.Y, 0, 0, ModProjectile.getTypeByName("ThunderBirdScreech"), 0, 0, Terraria.Main.myPlayer, 0, 0, 0, null);
  }
}