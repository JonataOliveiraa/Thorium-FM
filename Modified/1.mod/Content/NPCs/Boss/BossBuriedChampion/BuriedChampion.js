import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModNPC } from '../../../../TL/ModNPC.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { WorldDB } from '../../../../TL/WorldDB.js';
import { ModLocalization } from '../../../../TL/ModLocalization.js';
import { BestiaryOrder } from '../../../Global/Utils/BestiaryOrder.js';

const MasterPetDrop = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];

const { Color, Vector2, Effects } = Modules;
const { ItemDropRule, Conditions } = Terraria.GameContent.ItemDropRules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewNPC = Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];

const IItemDropRule = new NativeClass('Terraria.GameContent.ItemDropRules', 'IItemDropRule');
const OneFromRulesRule = new NativeClass('Terraria.GameContent.ItemDropRules', 'OneFromRulesRule');

function playSound(style, center) {
  try {
    if (style && center) {
      Effects.PlaySound(style, center.X, center.Y);
    }
  } catch (_) { }
}

let _buriedShockType = -1;
let _buriedDaggerSpawnerType = -1;
let _buriedArrowType = -1;
let _buriedArrow2Type = -1;
let _buriedArrowCType = -1;
let _buriedArrowPType = -1;
let _buriedArrowFType = -1;
let _buriedMagicType = -1;
let _magicalBurstNPCType = -1;
let _fallenChamp1Type = -1;
let _fallenChamp2Type = -1;
let _typesInit = false;

function initTypes() {
  if (_typesInit) return;
  _typesInit = true;
  _buriedShockType = ModProjectile.getTypeByName('BuriedShock');
  _buriedDaggerSpawnerType = ModProjectile.getTypeByName('BuriedDaggerSpawner');
  _buriedArrowType = ModProjectile.getTypeByName('BuriedArrow');
  _buriedArrow2Type = ModProjectile.getTypeByName('BuriedArrow2');
  _buriedArrowCType = ModProjectile.getTypeByName('BuriedArrowC');
  _buriedArrowPType = ModProjectile.getTypeByName('BuriedArrowP');
  _buriedArrowFType = ModProjectile.getTypeByName('BuriedArrowF');
  _buriedMagicType = ModProjectile.getTypeByName('BuriedMagic');
  _magicalBurstNPCType = ModNPC.getTypeByName('MagicalBurst');
  _fallenChamp1Type = ModNPC.getTypeByName('FallenChampion1');
  _fallenChamp2Type = ModNPC.getTypeByName('FallenChampion2');
}

function clamp(val, min, max) {
  return val < min ? min : (val > max ? max : val);
}

export class BuriedChampion extends ModNPC {
  constructor() {
    super();
    this.Texture = 'NPCs/Boss/BossBuriedChampion/' + this.constructor.name;
    this.phaseSwapTimer = 0;
    this.counter = 0;
    this.flux = 0;
    this.shift = false;
    this.sideRight = false;
    this.shifted = 0;
    this.angry = 0;
    this.attackState = 0;
    this.strike = false;
    this.charge = false;
    this.charging = false;
    this.chargeTimer = 0;
  }

  DeathMessage = (npc) => {
      return Terraria.Localization.Language.GetText('Announcement.HasBeenDefeated_Single'
      ).Value.replace('{0}', ModLocalization.Translate('NPCName.BuriedChampion'));
  }

  SetStaticDefaults() {
    Terraria.Main.npcFrameCount[this.Type] = 14;
    this.BestiaryRarityStars = 3;
    this.Music = Terraria.ID.MusicID.Boss5;
  }

  PostSetupContent() {
      BestiaryOrder.BossBefore(this.Type, 113);
  }

  SetDefaults() {
    this.NPC.width = 66;
    this.NPC.height = 66;
    this.NPC.damage = 35;
    this.NPC.defense = 10;
    this.NPC.lifeMax = 7000;
    this.NPC.knockBackResist = 0.0;
    this.NPC.noTileCollide = true;
    this.NPC.lavaImmune = true;
    this.NPC.noGravity = true;
    this.NPC.boss = true;
    this.NPC.scale = 1.0;
    this.NPC.HitSound = Terraria.ID.SoundID.NPCHit4;
    this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath39;
    this.NPC.npcSlots = 20;
    this.NPC.value = ModNPC.NPCValue(0, 6, 0, 0);
  }

  ApplyDifficultyAndPlayerScaling(npc, numPlayers, balance, bossAdjustment) {
    let lifeMax = 7000;
    if (Terraria.Main.masterMode) {
      lifeMax = 12500;
    } else if (Terraria.Main.expertMode) {
      lifeMax = 9800;
    }
    npc.lifeMax = Math.floor(lifeMax * balance);
    npc.damage = 35;
    npc.defense = 10;
  }

  ApplyBuffImmunity(npc) {
    npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
    npc.buffImmune[Terraria.ID.BuffID.Poisoned] = true;
  }

  SetBestiary(database, bestiaryEntry) {
    bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Marble);

    const flavor = FlavorTextBestiaryInfoElement.new();
    flavor._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
    bestiaryEntry.Info.Add(flavor);
  }

  ModifyNPCLoot(npcLoot) {
    const notExpert = Conditions.NotExpert.new();

    npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.HealingPotion, 1, 5, 15));

    const maskId = ModItem.getTypeByName('BuriedChampionMask');
    if (maskId > 0) {
      npcLoot.Add(ItemDropRule.ByCondition(notExpert, maskId, 7, 1, 1, 1));
    }

    npcLoot.Add(ItemDropRule.ByCondition(notExpert, Terraria.ID.ItemID.Marble, 1, 30, 60, 1));

    const fragId = ModItem.getTypeByName('BronzeAlloyFragments');
    if (fragId > 0) {
      npcLoot.Add(ItemDropRule.ByCondition(notExpert, fragId, 1, 4, 6, 1));
    }

    const itemNames = [
      'ChampionSwiftBlade',
      'ChampionsTrifectaShot',
      'ChampionBomberStaff',
      'ChampionsGodHand',
      'ChampionsRebuttal'
    ];

    const validRules = [];
    for (const name of itemNames) {
      const type = ModItem.getTypeByName(name);
      if (type > 0) {
        validRules.push(ItemDropRule.ByCondition(notExpert, type, 1, 1, 1, 1));
      }
    }

    if (validRules.length > 0) {
      const options = validRules.makeGeneric(IItemDropRule);
      const oneDropRule = OneFromRulesRule.new();
      oneDropRule['void .ctor(int chanceDenominator, IItemDropRule[] options)'](1, options);
      npcLoot.Add(oneDropRule);
    }

    const bagId = ModItem.getTypeByName('BuriedChampionTreasureBag');
    if (bagId > 0) {
      npcLoot.Add(ItemDropRule.BossBag(bagId));
    }
  }

  GetAlpha(npc, drawColor) {
    return Color.Lerp(drawColor, Color.White, 0.35);
  }

  FindFrame(npc, frameHeight) {
    const frame = npc.frame;

    if (this.strike) {
      npc.frameCounter += 1;
      if (npc.frameCounter > 6) {
        this.counter++;
        if (this.counter >= 14) {
          this.strike = false;
          this.counter = 0;
        }
        npc.frameCounter = 0;
      }
    }
    if (this.charge) {
      this.counter = 13;
    }
    if (this.attackState === 0 && !this.strike && !this.charge) {
      npc.frameCounter += 1;
      if (npc.frameCounter > 4) {
        this.counter++;
        if (this.counter >= 4) this.counter = 0;
        npc.frameCounter = 0;
      }
    }
    if (this.attackState === 1) {
      npc.frameCounter += 1;
      if (npc.frameCounter > 6) {
        this.counter++;
        if (this.counter >= 8) this.counter = 4;
        npc.frameCounter = 0;
      }
    }
    if (this.attackState === 2) {
      npc.frameCounter += 1;
      if (npc.frameCounter > 4) {
        this.counter++;
        if (this.counter >= 12) this.counter = 8;
        npc.frameCounter = 0;
      }
    }

    frame.Y = this.counter * frameHeight;
    npc.frame = frame;
  }

  AI(npc) {
    initTypes();

    if (this.phaseSwapTimer > 0) {
      const stationaryVelocity = npc.velocity;
      stationaryVelocity.X = 0;
      stationaryVelocity.Y = 0;
      npc.velocity = stationaryVelocity;
      this.phaseSwapTimer--;
      return;
    }

    npc.ai[0]++;
    npc.ai[2]++;
    npc.ai[3]++;

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
    const lifeRatio = npc.life / npc.lifeMax;
    const spawnSource = null;

    // ===== FASE 1: ESPADA (> 66% HP) =====
    if (lifeRatio >= 0.66) {
      this.attackState = 0;
      this.angry = lifeRatio >= 0.82 ? 0 : 15;

      if (npc.ai[0] === 80) {
        this.counter = 12;
        this.strike = true;
      }

      if (npc.ai[0] >= 90) {
        playSound(Terraria.ID.SoundID.Item1, npcCenter);
        if (_buriedShockType >= 0) {
          const dx = playerCenter.X - npcCenter.X;
          const dy = playerCenter.Y - npcCenter.Y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const speed = 12;
          NewProjectile(
            spawnSource,
            npcCenter.X, npcCenter.Y,
            (dx / len) * speed, (dy / len) * speed,
            _buriedShockType, 25, 0, npc.target, 0, 0, 0, null
          );
        }
        npc.ai[0] = this.angry;
      }

      if (npc.ai[2] >= 360) {
        const chargeVelocity = npc.velocity;
        chargeVelocity.X = 0;
        chargeVelocity.Y = 0;
        npc.velocity = chargeVelocity;
        npc.ai[0] = 0;
        this.charge = true;
        this.charging = true;
        this.chargeTimer = 0;

        for (let i = 0; i < 3; i++) {
          const dIdx = Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 57, -npc.spriteDirection * 8, 0, 100, Color.White, 0.75);
          const d = Terraria.Main.dust[dIdx];
          if (d) {
            d.velocity = Vector2.Multiply(d.velocity, 0.2);
            d.noGravity = true;
          }
        }
      }

      if (npc.ai[2] >= 420) {
        npc.aiStyle = -2;
        this.sideRight = !this.sideRight;
        const targetPos = Vector2.new(playerCenter.X, playerCenter.Y + 35);
        const dirVec = Vector2.SafeNormalize(Vector2.Subtract(targetPos, npcCenter), Vector2.Zero);
        npc.velocity = Vector2.Multiply(dirVec, 14);
        npc.ai[2] = 0;
        this.charging = true;
        this.chargeTimer = 0;
      }

      if (npc.ai[3] >= 600) {
        if (_buriedDaggerSpawnerType >= 0) {
          NewProjectile(
            spawnSource,
            playerCenter.X, playerCenter.Y,
            0, 0,
            _buriedDaggerSpawnerType, 0, 0, npc.target, 0, 0, 0, null
          );
        }
        npc.ai[3] = 0;
      }
    }

    // ===== FASE 2: ARCO (33% - 66% HP) =====
    else if (lifeRatio < 0.66 && lifeRatio > 0.33) {
      this.strike = false;
      this.charge = false;
      this.attackState = 1;
      this.angry = lifeRatio >= 0.5 ? 15 : 25;

      if (this.shifted !== 1) {
        this.counter = 4;
        npc.ai[0] = -60;
        npc.ai[2] = 0;
        npc.ai[3] = 0;
        this.phaseSwapTimer = 120;
        playSound(Terraria.ID.SoundID.Item102, npcCenter);
        for (let i = 0; i < 20; i++) {
          Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 57, Math.random() * 12 - 6, Math.random() * 12 - 6, 255, Color.White, 1.5);
        }
        this.shifted = 1;
      }

      if (npc.ai[0] >= 60) {
        playSound(Terraria.ID.SoundID.Item5, npcCenter);
        if (_buriedArrowType >= 0) {
          const dx = playerCenter.X - npcCenter.X;
          const dy = playerCenter.Y - npcCenter.Y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const speed = 10;
          NewProjectile(
            spawnSource,
            npcCenter.X, npcCenter.Y,
            (dx / len) * speed, (dy / len) * speed,
            _buriedArrowType, 20, 0, npc.target, 0, 0, 0, null
          );
        }
        npc.ai[0] = this.angry;
      }

      if (npc.ai[2] === 580) {
        npc.ai[3] -= 120;
      }

      if (npc.ai[2] >= 580) {
        npc.aiStyle = -2;
        this.sideRight = !this.sideRight;
        const side = this.sideRight ? 1 : -1;
        const targetPos = Vector2.new(playerCenter.X + side * 350, playerCenter.Y - 150);
        const dirVec = Vector2.SafeNormalize(Vector2.Subtract(targetPos, npcCenter), Vector2.Zero);
        npc.velocity = Vector2.Multiply(dirVec, 12);
      }

      if (npc.ai[2] >= 600) {
        playSound(Terraria.ID.SoundID.Item102, npcCenter);
        if (_buriedArrow2Type >= 0) {
          NewProjectile(spawnSource, npcCenter.X, npcCenter.Y, 3.5, 0, _buriedArrow2Type, 20, 0, npc.target, 0, 0, 0, null);
          NewProjectile(spawnSource, npcCenter.X, npcCenter.Y, -3.5, 0, _buriedArrow2Type, 20, 0, npc.target, 0, 0, 0, null);
          NewProjectile(spawnSource, npcCenter.X, npcCenter.Y, 0, -2.5, _buriedArrow2Type, 20, 0, npc.target, 0, 0, 0, null);
          NewProjectile(spawnSource, npcCenter.X, npcCenter.Y, 2, -2, _buriedArrow2Type, 20, 0, npc.target, 0, 0, 0, null);
          NewProjectile(spawnSource, npcCenter.X, npcCenter.Y, -2, -2, _buriedArrow2Type, 20, 0, npc.target, 0, 0, 0, null);
        }
        npc.ai[2] = 0;
      }

      if (npc.ai[3] >= 300) {
        if (npc.ai[3] === 300) {
          playSound(Terraria.ID.SoundID.Item43, npcCenter);
          for (let i = 0; i < 10; i++) {
            Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 57, Math.random() * 12 - 6, Math.random() * 12 - 6, 0, Color.White, 1.25);
          }
        }
        const elementalPauseVelocity = npc.velocity;
        elementalPauseVelocity.X = 0;
        elementalPauseVelocity.Y = 0;
        npc.velocity = elementalPauseVelocity;
        npc.ai[0] = 0;

        if (npc.ai[3] === 360 || npc.ai[3] === 390 || npc.ai[3] >= 420) {
          let dustId = 113, dustScale = 1.0, arrowType = _buriedArrowCType;

          if (npc.ai[3] === 390) {
            dustId = 44;
            arrowType = _buriedArrowPType;
          } else if (npc.ai[3] >= 420) {
            dustId = 6;
            dustScale = 1.25;
            arrowType = _buriedArrowFType;
            npc.ai[3] = -120;
          }

          for (let i = 0; i < 8; i++) {
            const d = Terraria.Dust.NewDust(npc.position, npc.width, npc.height, dustId, Math.random() * 6 - 3, Math.random() * 6 - 3, 125, Color.White, dustScale);
            if (Terraria.Main.dust[d]) Terraria.Main.dust[d].noGravity = true;
          }

          playSound(Terraria.ID.SoundID.Item102, npcCenter);
          if (arrowType >= 0) {
            const dx = playerCenter.X - npcCenter.X;
            const dy = playerCenter.Y - npcCenter.Y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            NewProjectile(
              spawnSource,
              npcCenter.X - 10, npcCenter.Y,
              (dx / len) * 14, (dy / len) * 14,
              arrowType, 30, 0, npc.target, 0, 0, 0, null
            );
          }
        }
      }
    }

    // ===== FASE 3: CAJADO / MAGIA (<= 33% HP) =====
    else if (lifeRatio <= 0.33) {
      npc.defense = 0;
      this.strike = false;
      this.charge = false;
      this.charging = false;
      this.attackState = 2;

      if (this.shifted !== 2) {
        this.counter = 8;
        playSound(Terraria.ID.SoundID.Item43, npcCenter);
        npc.ai[0] = 0;
        npc.ai[2] = 0;
        npc.ai[3] = 0;
        this.phaseSwapTimer = 120;
        for (let i = 0; i < 20; i++) {
          Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 15, Math.random() * 12 - 6, Math.random() * 12 - 6, 255, Color.White, 1.5);
        }

        if (_fallenChamp2Type >= 0) {
          NewNPC(null, (npcCenter.X + 45) | 0, npcCenter.Y | 0, _fallenChamp2Type, 0, 0, 0, 0, 0, 255);
        }
        if (Terraria.Main.expertMode && _fallenChamp1Type >= 0) {
          NewNPC(null, (npcCenter.X - 45) | 0, npcCenter.Y | 0, _fallenChamp1Type, 0, 0, 0, 0, 0, 255);
        }
        this.shifted = 2;
      }

      if (npc.ai[3] >= 90) {
        playSound(Terraria.ID.SoundID.Item73, npcCenter);
        if (_buriedMagicType >= 0) {
          const dx = playerCenter.X - npcCenter.X;
          const dy = playerCenter.Y - npcCenter.Y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const speed = 9;
          NewProjectile(
            spawnSource,
            npcCenter.X, npcCenter.Y,
            (dx / len) * speed, (dy / len) * speed,
            _buriedMagicType, 25, 0, npc.target, 0, 0, 0, null
          );
        }
        npc.ai[3] = 0;
      }

      if (npc.ai[0] >= 580) {
        npc.ai[3] = -60;
        npc.aiStyle = -2;
        this.sideRight = !this.sideRight;
        const side = this.sideRight ? 1 : -1;
        const targetPos = Vector2.new(playerCenter.X + side * 350, playerCenter.Y - 150);
        const dirVec = Vector2.SafeNormalize(Vector2.Subtract(targetPos, npcCenter), Vector2.Zero);
        npc.velocity = Vector2.Multiply(dirVec, 10);
      }

      if (npc.ai[0] >= 600) npc.ai[0] = 0;

      if (npc.ai[2] > 300) {
        npc.ai[3] = 0;
        const magicPauseVelocity = npc.velocity;
        magicPauseVelocity.X = 0;
        magicPauseVelocity.Y = 0;
        npc.velocity = magicPauseVelocity;
        const d = Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 113, 0, 0, 100, Color.White, 1.25);
        if (Terraria.Main.dust[d]) {
          Terraria.Main.dust[d].noGravity = true;
          Terraria.Main.dust[d].velocity = Vector2.Multiply(Terraria.Main.dust[d].velocity, 0.75);
        }
      }

      if (npc.ai[2] === 360 || npc.ai[2] === 420 || npc.ai[2] === 480) {
        for (let i = 0; i < 10; i++) {
          const d = Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 113, Math.random() * 6 - 3, Math.random() * 6 - 3, 0, Color.White, 1.25);
          if (Terraria.Main.dust[d]) Terraria.Main.dust[d].noGravity = true;
        }

        playSound(Terraria.ID.SoundID.Item45, npcCenter);

        if (_magicalBurstNPCType >= 0) {
          NewNPC(
            null,
            npcCenter.X | 0,
            (npcCenter.Y + 16) | 0,
            _magicalBurstNPCType,
            0, playerCenter.X, playerCenter.Y, 0, 0, 255
          );
        }

        if (npc.ai[2] === 480) npc.ai[2] = -300;
      }
    }

    // ===== MOVIMENTO: voo amplo e fluido acima do jogador =====
    const dx = playerCenter.X - npcCenter.X;
    npc.spriteDirection = dx > 0 ? 1 : -1;

    // Senoidal: não há troca brusca de direção no topo/fundo da oscilação.
    this.flux += 0.032;
    if (this.flux >= Math.PI * 2) this.flux -= Math.PI * 2;

    const velocity = npc.velocity;
    if (!this.charging) {
      npc.aiStyle = -1;
      this.charge = false;
      this.chargeTimer = 0;

      const distAbsX = Math.abs(dx);
      let targetX = playerCenter.X;
      if (distAbsX <= 560) {
        const side = this.sideRight ? 1 : -1;
        targetX = playerCenter.X + side * 390;
      }

      // Voo 70px maior que o anterior, com leve oscilação horizontal.
      const targetY = playerCenter.Y - 185 + Math.sin(this.flux) * 130;
      targetX += Math.cos(this.flux * 0.65) * 45;

      const desiredX = clamp((targetX - npcCenter.X) * 0.032, -8.5, 8.5);
      const desiredY = clamp((targetY - npcCenter.Y) * 0.038, -6.5, 6.5);

      // Steering com inércia: o chefe desacelera antes de inverter o voo.
      velocity.X += (desiredX - velocity.X) * 0.075;
      velocity.Y += (desiredY - velocity.Y) * 0.09;
    } else {
      this.chargeTimer = (this.chargeTimer || 0) + 1;
      if (this.chargeTimer > 60 || Math.abs(dx) < 150) {
        this.charging = false;
        this.charge = false;
        this.chargeTimer = 0;
      }
    }
    npc.velocity = velocity;
  }

  HitEffect(npc, hitDirection, damage) {
    if (npc.life <= 0) {
      for (let i = 0; i < 10; i++) {
        Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 1, Math.random() * 8 - 4, Math.random() * 8 - 4, 0, Color.White, 1.5);
      }
      for (let i = 0; i < 20; i++) {
        Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 57, Math.random() * 8 - 4, Math.random() * 8 - 4, 0, Color.White, 1.0);
      }
    } else {
      const numDust = Math.floor((damage / npc.lifeMax) * 50);
      for (let i = 0; i < numDust; i++) {
        Terraria.Dust.NewDust(npc.position, npc.width, npc.height, 57, Math.random() * 6 - 3, Math.random() * 6 - 3, 0, Color.White, 1.2);
      }
    }
  }

  OnKill(npc) {
  if (Math.random() < 0.25 && Terraria.Main.masterMode) {
      MasterPetDrop(npc.position.X, npc.position.Y, npc.width, npc.height,
          ModItem.getTypeByName('SwordOfDestiny'), 1, false, 0, false);
  }

    WorldDB.set('Thorium:HasBeenDefeated_BuriedChampion', true);
  }
}
