import { Terraria, Modules, Microsoft } from "../../TL/ModImports.js";
import { ModPlayer } from "../../TL/ModPlayer.js";
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Color } from "../../TL/Modules/Color.js";
import { Effects } from "../../TL/Modules/Effects.js";
import { Vector2 } from "../../TL/Modules/Vector2.js";
import { Rectangle } from "../../TL/Modules/Rectangle.js";
import { LifeShieldPlayer } from "./LifeShieldPlayer.js";
import { ModBuff } from "../../TL/ModBuff.js";
import { Rand } from "../../TL/Modules/Rand.js";
import { ModItem } from "../../TL/ModItem.js";
import { Bard, Healer, Thrower } from "./ThoriumClasses.js";
import { ModHealerItem } from "../../Common/ModHealerItem.js";
import { ProjAI } from "../../TL/ProjAI.js";
import { PlayerDB } from "../../TL/PlayerDB.js";
import { Empowerments } from "./Empowerments.js";
import { ModBardItem } from "../../Common/ModBardItem.js";
import { BardTimer } from "./BardTimer.js";
import { Profiler } from "../../Profiler.js";
import { WorldDB } from "../../TL/WorldDB.js";
import { MiscHelper } from "./Utils/MiscHelper.js";

const Inventory_Layout = new NativeClass('', 'Inventory_Layout');
const Hotbar_Layout = new NativeClass('', 'Hotbar_Layout');
const Buffs_Layout = new NativeClass('', 'Buffs_Layout');
const LayoutCalculator = new NativeClass('', 'LayoutCalculator');
const GUIInstance = new NativeClass('', 'GUIInstance');

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewItem = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];
const StrikeNPCNoInteraction = 'double StrikeNPCNoInteraction(int Damage, float knockBack, int hitDirection, bool crit, bool noEffect, bool fromNet)';
const SpriteFrame = new NativeClass('Terraria.DataStructures', 'SpriteFrame');

const { ItemID } = Terraria.ID;
const { Main } = Terraria;

export class ThoriumPlayer extends ModPlayer {
  static class = {
    Bard: new Bard(),
    Healer: new Healer(),
    Thrower: new Thrower()
  }

  constructor() {
    super();
    this.previousItemType = -1;
  }
  static COBBLER_ITEMS = new Set([
    ItemID.Aglet,
    ItemID.ShoeSpikes,
    ItemID.HermesBoots,
    ItemID.FlurryBoots,
    ItemID.SailfishBoots,
    ItemID.FrogLeg,
    ItemID.IceSkates,
    ItemID.WaterWalkingBoots,
    ItemID.Flipper,
    ItemID.RocketBoots,
    ItemID.FlowerBoots,
    212,
    ItemID.FlameWakerBoots,
    ItemID.TigerClimbingGear,
    ItemID.AmphibianBoots,
    ItemID.FrogFlipper,
    ItemID.FrogGear,
    ItemID.FairyBoots,
    ItemID.HellfireTreads,
    ItemID.SpectreBoots,
    ItemID.LightningBoots,
    ItemID.ObsidianWaterWalkingBoots,
    ItemID.LavaWaders,
    ItemID.FrostsparkBoots,
    ItemID.TerrasparkBoots,
    ItemID.Tabi,
    ItemID.MasterNinjaGear
  ]);

  static _cachedWheelPos = { X: 0, Y: 0 };
  static _wheelPosCacheTimer = 0;

  static _vec = Vector2.new(0, 0);
  static _vec2 = Vector2.new(0, 0);
  static _color = Color.new(255, 255, 255, 255);
  static _whiteColor = Color.White; // referência estática

  static _wheelSpriteFrame = null;

  static _bardItemCache = new Map();

  static _coralSlasherType = -1;
  static _crietzProType = -1;
  static _incubatedSpiderType = -1;
  static _seaTurtlesBulwarkProType = -1;

  static _bardHealColor = Color.new(65, 217, 131)

  static _cachedHeldType = null;
  static _cachedBardItem = null

  static resTimeCount = 0
  static resTimeMax = 320
  static resLastManaSpent = 0;
  static resLastInspirationSpent = 0;

  // Basic
  static InCombat = false;
  static CombatTimer = 0;
  static CombatDelay = 320;
  static CombatTimeAccumulated = 0;

  static InvincibilityFrameBonus = 0;

  // Cave Rare Monster
  static SalamanterEyeEquipped = false;
  static GiantShellSpineEquipped = false;
  static CrawdadClawEquipped = false;

  static CrietzEquipped = false;
  static CrietzInvoke = false;
  static CrietzMaxTimeDelay = 60;
  static CrietzTimeDelay = 0;

  // Spring Steps
  static SpringStepsEquipped = false;
  static jumps = 0;
  static allowJump = true;

  // Armor, Accessories, etc.
  static LifeRecoveryDelayTime = 0;
  static LifeRecoveryDelayMaxTime = 100;
  static LifeRecoveryExtraValue = 0;
  static LifeRecoveryBuffActive = false;
  static LifeRecoveryBuffDelayTime = 0;

  static equipJesterShirt = false;
  static setJester = false;

  static LavaHugBuffDelayTime = 0;
  static LivingWoodAcornArmorBuff = false;

  static IncubatedEggBuff = false;
  static IncubatedEggLimit = 4;
  static IncubatedEggCount = 0;

  static RadiantCorruptionActive = false;

  static IcyArmorBuff = false;
  static IcyArmorPro = false;

  static accVibrationTuner = false

  static FabergeEggEquipped = false;
  static FabergeEggMaxDelay = 90;
  static FabergeEggDelay = 0;
  static _fabergeEggProType = -1;

  static PlungerMuteActive = false

  static soulEssenceStackMax = 5;
  static soulEssenceCD = 0;
  static soulEssenceCDMax = 30;
  static soulEssenceReady = true;
  static soulEssenceActive = false;

  static IsHoldingGrimPointer = false;

  static YewWoodSetBonus = false;
  static YewWoodAccumulated = 0;
  static YewWoodHitsCount = 0;

  static accMouthPiece = false;

  static NoviceClericSetBonus = false;
  static NoviceClericCrossCount = 0;
  static NoviceClericCrossDelay = 0;
  static NoviceClericCrossMaxDelay = 0;
  static NoviceClericAttackDelay = 0;
  static NoviceClericCrossIds = new Set();

  static BloomingSetBonus = false;

  static ThumbRingEquipped = false;

  static setDepthDiverHelmet = false;
  static setTideHunter = false;

  static SpiritsGraceEquipped = false;
  static SpiritsGraceDieEffect = false;

  static MoltenScaleEquipped = false;
  static MoltenScaleMaxTimeDelay = 15;
  static MoltenScaleTimeDelay = 0;

  static SeaTurtlesBulwarkEquipped = false;
  static SeaTurtlesBulwarkMaxTimeDelay = 60;
  static SeaTurtlesBulwarkTimeDelay = 0;

  static HoverBootsEquipped = false;
  static HoverBootsCanHover = false;
  static HoverBootsJumped = false;
  static HoverBootsHoverTimer = 0;
  static HoverBootsJumpTimer = 0;

  static CoralSetBuff = false;
  static CoralSetCount = 0;
  static CoralSetResetCount = 0;

  static CoralSlasherCharge = 0;
  static CoralSlasherReady = false;

  // Sheath
  static _hitThisSwing = false;
  static ShealthTypes = {
    0: 'LeatherSheath',
    1: 'LeechingSheath',
    2: 'TitanSlayerSheath'
  };
  static SheatType = undefined;
  static SheathMaxCooldown = undefined;
  static SheathCooldown = 0;
  static SheatDamageMultiplier = 0;
  static SheatCriticalChanceBonus = 0;

  // LifeShield
  static LifeShieldActive = false;
  static LifeShieldIsDefault = true;
  static LifeShieldMaxExtraLife = null;
  static LifeShieldHealValue = 1;
  static LifeShieldTimeDelay = 0;
  static LifeShieldMaxTimeDelay = 120;

  static LuckyRabbitsFootEquipped = false;
  static BandofReplenishmentEquipped = false;

  // Bard UI
  static SpriteSheet = null;
  static Timer = 0;
  static DisplayInspiration = 0;
  static PreviousInspiration = 0;
  static RegenCooldown = 0;
  static num1 = 0;

  OnEnterWorld(player) {
    if (!PlayerDB.has("Inspiration")) PlayerDB.set("Inspiration", 0);
    if (!PlayerDB.has("InspirationMax")) PlayerDB.set("InspirationMax", 10);
    if (!PlayerDB.has("BardBuffDurationX")) PlayerDB.set("BardBuffDurationX", 1.0);
    PlayerDB.set("Inspiration", 0);
    ThoriumPlayer.PreviousInspiration = 0;
    ThoriumPlayer.RegenCooldown = 60;
  }

  ResetEffects(player) {
    ThoriumPlayer.InvincibilityFrameBonus = 0;
    ThoriumPlayer.SpringStepsEquipped = false;
    ThoriumPlayer.IncubatedEggBuff = false;
    ThoriumPlayer.LivingWoodAcornArmorBuff = false;
    ThoriumPlayer.IcyArmorBuff = false;

    ThoriumPlayer.LifeShieldActive = false;
    ThoriumPlayer.LifeShieldMaxExtraLife = null;
    ThoriumPlayer.LifeShieldHealValue = 1;

    ThoriumPlayer.LifeRecoveryBuffActive = false;
    ThoriumPlayer.LifeRecoveryDelayMaxTime = 100;
    ThoriumPlayer.LifeRecoveryExtraValue = 0;

    ThoriumPlayer.SheatType = undefined;
    ThoriumPlayer.SheathMaxCooldown = undefined;
    ThoriumPlayer.SheatDamageMultiplier = 0;
    ThoriumPlayer.SheatCriticalChanceBonus = 0;

    ThoriumPlayer.accMouthPiece = false;

    ThoriumPlayer.soulEssenceActive = false;

    ThoriumPlayer.HoverBootsEquipped = false;

    ThoriumPlayer.LuckyRabbitsFootEquipped = false;
    ThoriumPlayer.BandofReplenishmentEquipped = false;

    ThoriumPlayer.setDepthDiverHelmet = false;
    ThoriumPlayer.setTideHunter = false;

    ThoriumPlayer.SalamanterEyeEquipped = false;
    ThoriumPlayer.CrawdadClawEquipped = false;
    ThoriumPlayer.GiantShellSpineEquipped = false;

    ThoriumPlayer.accVibrationTuner = false
    ThoriumPlayer.setJester = false;
    ThoriumPlayer.CrietzEquipped = false;

    ThoriumPlayer.PlungerMuteActive = false;

    ThoriumPlayer.IsHoldingGrimPointer = false;

    ThoriumPlayer.NoviceClericSetBonus = false;

    ThoriumPlayer.equipJesterShirt = false;

    ThoriumPlayer.FabergeEggEquipped = false;

    // Bard
    const bard = ThoriumPlayer.class.Bard;
    bard.symphonicDamage = 0;
    bard.symphonicCrit = 0;
    bard.multiplier = 1.0;
    bard.inspirationMax2 = 0;
    bard.inspirationRegenBonus = 1.0;
    bard.inspirationRegenBase = 1;
    bard.bardBuffDurationX = 1.0;
    bard.inspirationConsume = 1;
    bard.bardBuffDurationFlat = 0;

    // Healer
    const healer = ThoriumPlayer.class.Healer;
    healer.radiantDamage = 0;
    healer.radiantCrit = 0;
    healer.multiplier = 1.0;
    healer.healPowerMultiply = 1.0;
    healer.healPowerExtraValue = 0;

    // Thrower
    const thrower = ThoriumPlayer.class.Thrower;
    thrower.throwingDamage = 0;
    thrower.multiplier = 1.0;

    ThoriumPlayer.MoltenScaleEquipped = false;
    ThoriumPlayer.RadiantCorruptionActive = false;
    ThoriumPlayer.SeaTurtlesBulwarkEquipped = false;
    ThoriumPlayer.YewWoodSetBonus = false;
    ThoriumPlayer.YewWoodAccumulated = 0;
    ThoriumPlayer.ThumbRingEquipped = false;
    ThoriumPlayer.SpiritsGraceEquipped = false;
    ThoriumPlayer.CoralSetBuff = false;
    ThoriumPlayer.CoralSetResetCount = 0;
  }

  PreUpdate(player) {
    if (player.dead) {
      ThoriumPlayer.SheathCooldown = 0;
    }

    ThoriumPlayer.UpdateInspiration();
    ThoriumPlayer.UpdateTimer();

    if (player.HeldItem && player.HeldItem.type !== this.previousItemType) {
      ThoriumPlayer.SheathCooldown = 0;
      this.previousItemType = player.HeldItem.type;
    }

    if (ThoriumPlayer.CoralSetBuff && ThoriumPlayer.CoralSetCount > 0) {
      ThoriumPlayer.LifeShieldActive = true;
      ThoriumPlayer.LifeShieldMaxExtraLife = ThoriumPlayer.CoralSetCount;
    }

    if (ThoriumPlayer.LifeShieldActive) {
      if (ThoriumPlayer.LifeShieldMaxExtraLife === null) return;
      Terraria.GameContent.TextureAssets.Heart = LifeShieldPlayer.Heart_Shield_Texture;
      Terraria.GameContent.TextureAssets.Heart2 = LifeShieldPlayer.Heart2_Shield_Texture;
      Terraria.GameContent.TextureAssets.FancyHeart = LifeShieldPlayer.Heart_Shield_Texture;
      Terraria.GameContent.TextureAssets.FancyHeart2 = LifeShieldPlayer.Heart2_Shield_Texture;
      Terraria.GameContent.TextureAssets.BarHeart = LifeShieldPlayer.BarHeart_Shield_Texture;
      Terraria.GameContent.TextureAssets.BarHeart2 = LifeShieldPlayer.BarHeart2_Shield_Texture;

      ThoriumPlayer.LifeShieldIsDefault = false;

      if (player.statLife < player.statLifeMax2 && !player.dead) {
        ThoriumPlayer.LifeShieldTimeDelay++;
        if (ThoriumPlayer.LifeShieldMaxTimeDelay <= ThoriumPlayer.LifeShieldTimeDelay) {
          ThoriumPlayer.LifeShieldTimeDelay = 0;
          LifeShieldPlayer.HealPlayer(player, ThoriumPlayer.LifeShieldHealValue);
        }
      }
    } else if (!ThoriumPlayer.LifeShieldIsDefault) {
      Terraria.GameContent.TextureAssets.Heart = LifeShieldPlayer.Default_Heart;
      Terraria.GameContent.TextureAssets.Heart2 = LifeShieldPlayer.Default_Heart2;
      Terraria.GameContent.TextureAssets.FancyHeart = LifeShieldPlayer.Default_HeartFancy;
      Terraria.GameContent.TextureAssets.FancyHeart2 = LifeShieldPlayer.Default_HeartFancy2;
      Terraria.GameContent.TextureAssets.BarHeart = LifeShieldPlayer.Default_BarHeart;
      Terraria.GameContent.TextureAssets.BarHeart2 = LifeShieldPlayer.Default_BarHeart2;
      ThoriumPlayer.LifeShieldIsDefault = true;
    }
  }

  PostUpdate(player) {
    ThoriumPlayer.UpdateClassItemsCrit(player);

    ThoriumPlayer.resTimeCount++

    if (!ThoriumPlayer.soulEssenceReady) ThoriumPlayer.soulEssenceCD++
    if (ThoriumPlayer.soulEssenceCD >= ThoriumPlayer.soulEssenceCDMax) {
      ThoriumPlayer.soulEssenceCD = 0
      ThoriumPlayer.soulEssenceReady = true
    }

    if (ThoriumPlayer.resTimeMax <= ThoriumPlayer.resTimeCount) ThoriumPlayer.ResetResources()

    if (ThoriumPlayer.InCombat) {
      ThoriumPlayer.CombatTimer++;
      ThoriumPlayer.CombatTimeAccumulated++;

      if (ThoriumPlayer.CombatTimer >= ThoriumPlayer.CombatDelay) {
        ThoriumPlayer.InCombat = false;
        ThoriumPlayer.CombatTimer = 0;
        ThoriumPlayer.CombatTimeAccumulated = 0;
      }
    }

    if (!ThoriumPlayer.CrietzInvoke && ThoriumPlayer.CrietzEquipped) {
      ThoriumPlayer.CrietzTimeDelay++;
      if (ThoriumPlayer.CrietzTimeDelay >= ThoriumPlayer.CrietzMaxTimeDelay) {
        ThoriumPlayer.CrietzInvoke = true;
        ThoriumPlayer.CrietzTimeDelay = 0;
      }
    }

    if (ThoriumPlayer.SeaTurtlesBulwarkEquipped && ThoriumPlayer.SeaTurtlesBulwarkTimeDelay > 0) {
      ThoriumPlayer.SeaTurtlesBulwarkTimeDelay--;
    }

    if (ThoriumPlayer._coralSlasherType === -1) {
      ThoriumPlayer._coralSlasherType = ModItem.getTypeByName('CoralSlasher');
    }
    if (player.HeldItem && player.HeldItem.type === ThoriumPlayer._coralSlasherType && ThoriumPlayer.CoralSlasherCharge >= 3) {
      const dustIdx = Terraria.Dust.NewDust(
        player.position, player.width, player.height,
        33, 0, 0, 0, ThoriumPlayer._whiteColor, 1.2
      );
      const dust = Terraria.Main.dust[dustIdx];
      if (dust) {
        dust.noGravity = true;
        const vel = dust.velocity;
        vel.X = 0;
        vel.Y = Rand.Next(-4, -2) * 0.5;
        dust.velocity = vel;
      }
      if (!ThoriumPlayer.CoralSlasherReady && player.itemAnimation <= 1) {
        ThoriumPlayer.CoralSlasherReady = true;
      }
    }

    if (ThoriumPlayer.SpringStepsEquipped) {
      if (player.velocity.Y < 0 && ThoriumPlayer.allowJump) {
        ThoriumPlayer.allowJump = false;
        ThoriumPlayer.jumps++;
        for (let i = 0; i < 5; i++) {
          Terraria.Dust.NewDust(player.position, player.width, player.height, 6, 0, 0, 0, Color.OrangeRed, 1.2);
        }
      }

      if (player.velocity.Y > 0 || player.sliding || player.justJumped) {
        ThoriumPlayer.allowJump = true;
      }

      if (ThoriumPlayer.jumps >= 3) {
        for (let i = 0; i < 20; i++) {
          Terraria.Dust.NewDust(player.position, player.width, player.height, 6, 0, 0, 0, Color.OrangeRed, 1.5);
        }
        Effects.PlaySound(Terraria.ID.SoundID.Item74, player.Center.x, player.Center.y);
        ThoriumPlayer.jumps = 0;
      }
    }

    if (ThoriumPlayer.LifeRecoveryBuffActive) {
      ThoriumPlayer.LifeRecoveryDelayTime++;

      if (ThoriumPlayer.LifeRecoveryDelayTime >= ThoriumPlayer.LifeRecoveryDelayMaxTime) {
        const value = 1 + ThoriumPlayer.LifeRecoveryExtraValue

        ThoriumPlayer.HealHPInHealerClass(player, value)
        ThoriumPlayer.LifeRecoveryDelayTime = 0
      }
    } else {
      ThoriumPlayer.LifeRecoveryDelayTime = 0;
    }

    if (ThoriumPlayer.FabergeEggDelay > 0) ThoriumPlayer.FabergeEggDelay--;
  }

  ModifyMaxStats(player) {
    if (ThoriumPlayer.LifeShieldActive) return this.CumulativeHealth = ThoriumPlayer.LifeShieldMaxExtraLife;
    return this.CumulativeHealth = 0;
  }

  ModifyWeaponDamage(player, item, damage) {
    let finalDamage = damage;

    if (
      ThoriumPlayer.SheathMaxCooldown !== undefined &&
      ThoriumPlayer.SheatType !== undefined &&
      ThoriumPlayer.SheathCooldown >= ThoriumPlayer.SheathMaxCooldown &&
      item.melee &&
      item.useStyle === Terraria.ID.ItemUseStyleID.Swing
    ) {
      switch (ThoriumPlayer.SheatType) {
        case 0:
          finalDamage += item.damage * ThoriumPlayer.SheatDamageMultiplier;
          break;
      }
    }

    if (player.FindBuffIndex(ModBuff.getTypeByName('CharmedBuff'))) {
      finalDamage -= this.WeaponDamage * 0.2;
    }

    if (ThoriumPlayer.setDepthDiverHelmet) {
      finalDamage += this.WeaponDamage * 0.1
    }

    return this.WeaponDamage = finalDamage;
  }

  ModifyShootStats(player, stats) {
    let finalDamageBonus = 0;

    if (player.HeldItem && player.HeldItem.useAmmo == Terraria.ID.AmmoID.Arrow && ThoriumPlayer.ThumbRingEquipped) {
      finalDamageBonus += stats.damage * 0.05;
    }

    stats.damage += finalDamageBonus;
  }

  PostUpdateBuffs(player) {
    Empowerments.Update(player);

    if (
      ThoriumPlayer.SheathMaxCooldown !== undefined &&
      ThoriumPlayer.SheatType !== undefined &&
      ThoriumPlayer.SheathCooldown >= ThoriumPlayer.SheathMaxCooldown
    ) {
      player.meleeCrit += ThoriumPlayer.SheatCriticalChanceBonus;
    }
  }

  OnHitNPC(player, item, npc, damageDone, knockBack) {
    ThoriumPlayer.EnterCombat();

    if (
      ThoriumPlayer.SheathMaxCooldown !== undefined &&
      ThoriumPlayer.SheatType !== undefined &&
      ThoriumPlayer.SheathCooldown >= ThoriumPlayer.SheathMaxCooldown &&
      item.melee &&
      item.useStyle === Terraria.ID.ItemUseStyleID.Swing
    ) {
      ThoriumPlayer._hitThisSwing = true;
    }

    if (ThoriumPlayer.CrietzInvoke && ThoriumPlayer.IsCriticalDamage(item, damageDone)) {
      ThoriumPlayer.CrietzProjectile(player, npc);
    }

    if (ThoriumPlayer.CoralSetBuff) {
      if (ModHealerItem.healerItemsName.has(item.type)) {
        ThoriumPlayer.CoralSetCount += Math.max(1, Math.floor(damageDone / 4));
        if (ThoriumPlayer.CoralSetCount > 20) ThoriumPlayer.CoralSetCount = 20;
      }
    }

    if (ThoriumPlayer.FabergeEggEquipped && ModBardItem.bardItemsName.has(item.type)) {
      if (npc.boss && ThoriumPlayer.FabergeEggDelay <= 0) {
        ThoriumPlayer.SpawnFabergeEgg(player, npc);
      }
    }
  }

  OnHitNPCWithProj(player, npc, projectile) {
    const isBardWeapon = player.HeldItem && ModBardItem.bardItemsName.has(player.HeldItem.type);
    ThoriumPlayer.EnterCombat();

    const isRangedWeapon = player.HeldItem && player.HeldItem.ranged;
    if (isRangedWeapon) ThoriumPlayer.YewWoodHitsCount++;

    const isHealerWeapon = player.HeldItem && ModHealerItem.healerItemsName.has(player.HeldItem.type);
    if (isHealerWeapon) {
      if (ThoriumPlayer.BloomingSetBonus) player.AddBuff(ModBuff.getTypeByName('OvergrowthBuff'), 120, false);
    }

    if (ThoriumPlayer.IncubatedEggBuff) {
      if (projectile.minion || Terraria.ID.ProjectileID.Sets.MinionShot[projectile.type]) {
        if (ThoriumPlayer.IncubatedEggCount >= ThoriumPlayer.IncubatedEggLimit) return;
        if (Rand.NextFloat() < 0.9) return;

        if (ThoriumPlayer._incubatedSpiderType === -1) {
          ThoriumPlayer._incubatedSpiderType = ModProjectile.getTypeByName('IncubatedSpider');
        }
        const source = projectile.GetProjectileSource_FromThis();
        NewProjectile(source, npc.Center, Vector2.new(0, -2), ThoriumPlayer._incubatedSpiderType, 2, 0, player.whoAmI, 0, 0, 0, null);
        ThoriumPlayer.IncubatedEggCount++;
      }
    }

    if (ThoriumPlayer.CrietzInvoke) {
      ThoriumPlayer.CrietzProjectile(player, npc);
    }

    if (ThoriumPlayer.YewWoodHitsCount > 6 && ThoriumPlayer.YewWoodSetBonus && isRangedWeapon) {
      let damage = player.HeldItem.damage;
      ThoriumPlayer.MiniCriticalDamage(npc, damage + Rand.Next(damage, damage + Math.round(damage * 0.1)));
      ThoriumPlayer.YewWoodHitsCount = 0;
    }

    if (ThoriumPlayer.ThumbRingEquipped) {
      if (projectile.arrow) {
        npc.AddBuff(153, Rand.Next(60, 120), false);
      }
    }

    if (ThoriumPlayer.CoralSetBuff) {
      if (ModHealerItem.healerItemsName.has(player.HeldItem.type)) {
        ThoriumPlayer.CoralSetCount += Math.max(1, Math.floor(projectile.damage / 4));
        if (ThoriumPlayer.CoralSetCount > 20) ThoriumPlayer.CoralSetCount = 20;
      }
    }

    if (ThoriumPlayer.setJester && isBardWeapon && Rand.Next(1, 8) === 1) {
      ThoriumPlayer.JesterEffect(player)
      Effects.PlaySound(Terraria.ID.SoundID.Item155, player.Center.X, player.Center.Y)
    }

    if (ThoriumPlayer.NoviceClericSetBonus && isHealerWeapon) {
      ThoriumPlayer.TriggerNoviceClericCross(npc);
    }

    if (ThoriumPlayer.FabergeEggEquipped && isBardWeapon) {
      if (npc.boss && ThoriumPlayer.FabergeEggDelay <= 0) {
        ThoriumPlayer.SpawnFabergeEgg(player, npc);
      }
    }

    if (ThoriumPlayer.equipJesterShirt && isBardWeapon && Rand.Next(1, 5) === 1) {
      player.AddBuff(2, 180, false)
    }

    if (
      ThoriumPlayer.accVibrationTuner
      && Rand.Next(0, 5) === 0
      && ThoriumPlayer.getCachedBardItem(player)?.instrumentStyle === 'Percussion'
    ) {
      npc.AddBuff(ModBuff.getTypeByName('StunnedBuff'), Rand.Next(20, 90))
    }

    if (ThoriumPlayer.setTideHunter && Rand.Next(1, 5) == 1) {
      console.log('Ativo')
      for (let i = 0; i < 10; i++) {
        const dustIndex = Effects.NewDust(
          npc.position, npc.width, npc.height,
          217,
          Rand.Next(-4, 4),
          Rand.Next(-4, 4),
          100, Color.White, 1
        );
        const dust = Main.dust[dustIndex];
        if (dust) {
          dust.noGravity = true;
          dust.noLight = true;
        }
      }
      for (let i = 0; i < Main.maxNPCs; i++) {
        const npc = Main.npc[i];
        if (npc.CanBeChasedBy(null, false) && npc['int FindBuffIndex(int type)'](197) > 0 &&
          Vector2.DistanceSquared(npc.Center, npc.Center) < 6400) {
          npc.AddBuff(197, 90, false);
        }

        Effects.PlaySound(Terraria.ID.SoundID.NPCHit26, npc.Center.X, npc.Center.y, 1, 0.5, 1)
      }
    }
  }

  OnHurt(player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
    ThoriumPlayer.EnterCombat();
    player.immuneTime += ThoriumPlayer.InvincibilityFrameBonus;

    if (!pvp && ThoriumPlayer.BandofReplenishmentEquipped) {
      if (damage > 3 && Rand.Next(0, 3) === 0) {
        player.Heal(1);
        player.statMana += 1;
        player.ManaEffect(1);
      }
    }

    if (!pvp && ThoriumPlayer.SeaTurtlesBulwarkEquipped && ThoriumPlayer.SeaTurtlesBulwarkTimeDelay <= 0) {
      if (ThoriumPlayer._seaTurtlesBulwarkProType === -1) {
        ThoriumPlayer._seaTurtlesBulwarkProType = ModProjectile.getTypeByName('SeaTurtlesBulwarkPro');
      }
      const speed = 2.0 + Rand.NextFloat() * 1.5;
      const angle = Rand.NextFloat() * Math.PI * 2;
      ThoriumPlayer._vec.X = Math.cos(angle) * speed;
      ThoriumPlayer._vec.Y = Math.sin(angle) * speed;
      const source = Terraria.Projectile.GetNoneSource();
      const healValue = Math.floor(damage * 0.25);

      NewProjectile(source, player.Center, ThoriumPlayer._vec, ThoriumPlayer._seaTurtlesBulwarkProType, 0, 0, player.whoAmI, 0, 0, healValue, null);
      ThoriumPlayer.SeaTurtlesBulwarkTimeDelay = ThoriumPlayer.SeaTurtlesBulwarkMaxTimeDelay;
    }
  }

  PostItemCheck(player) {
    if (player.itemAnimation === 1 &&
      ThoriumPlayer.SheatType !== undefined &&
      player.HeldItem && player.HeldItem.melee) {
      ThoriumPlayer.SheathCooldown = 0;
      ThoriumPlayer._hitThisSwing = false;
    }
  }

  OnRespawn(player) {
    ThoriumPlayer.CoralSetCount = 0;
    ThoriumPlayer.NoviceClericCrossIds.clear();
    ThoriumPlayer.CoralSlasherCharge = 0;
    ThoriumPlayer.CoralSlasherReady = false;

    if (ThoriumPlayer.SpiritsGraceDieEffect) {
      player['void AddBuff(int type, int time, bool fromNetPvP)'](ModBuff.getTypeByName('SpiritsGraceBuff'), 60, false);
      ThoriumPlayer.SpiritsGraceDieEffect = false;
    }
  }

  // ---- Static helpers ----

  MultiplyDamage(damage) {
    return damage * (1 + ThoriumPlayer.SheatDamageMultiplier);
  }

  UseTimeMultiplier(player, item) {
    if (ThoriumPlayer.YewWoodAccumulated > 0 && player.HeldItem && player.HeldItem.ranged)
      return 1.0 - ThoriumPlayer.YewWoodAccumulated * 0.025;
    return 1.0;
  }

  UseAnimationMultiplier(player, item) {
    if (ThoriumPlayer.YewWoodAccumulated > 0 && player.HeldItem && player.HeldItem.ranged)
      return 1.0 - ThoriumPlayer.YewWoodAccumulated * 0.025;
    return 1.0;
  }

  UpdateMovement(player) {
    if (!ThoriumPlayer.HoverBootsEquipped || player.mount.Active) {
      ThoriumPlayer.HoverBootsHoverTimer = 0;
      return;
    }

    if (player.controlDown) {
      ThoriumPlayer.HoverBootsJumped = true;
    }
    if (player.velocity.Y < 0) {
      ThoriumPlayer.HoverBootsJumped = true;
      ThoriumPlayer.HoverBootsJumpTimer = 0;
    }

    if (ThoriumPlayer.HoverBootsJumped) {
      if (player.velocity.Y === 0) {
        ThoriumPlayer.HoverBootsJumpTimer++;
      }
      if (ThoriumPlayer.HoverBootsJumpTimer >= 10) {
        ThoriumPlayer.HoverBootsJumped = false;
      }
    } else {
      ThoriumPlayer.HoverBootsJumpTimer = 0;
    }

    const isAirborne = !MiscHelper.IsOnStandableGround(
      player.BottomLeft.X,   // startX
      player.BottomLeft.Y,   // y
      player.width            // width
    );

    if (isAirborne) {
      if (ThoriumPlayer.HoverBootsHoverTimer === 0 && player.velocity.Y >= player.gravity) {
        let pos = player.position;
        pos.Y -= player.gravity;
        player.position = pos;
      }
      ThoriumPlayer.HoverBootsHoverTimer++;
    } else {
      ThoriumPlayer.HoverBootsHoverTimer = 0;
    }

    ThoriumPlayer.HoverBootsCanHover = ThoriumPlayer.HoverBootsHoverTimer < 80;

    if (ThoriumPlayer.HoverBootsCanHover && !ThoriumPlayer.HoverBootsJumped && isAirborne) {
      player.maxFallSpeed = 0;
      let vel = player.velocity;
      vel.Y = 0;
      player.velocity = vel;

      const bl = player.BottomLeft;
      const dustPos = Vector2.new(bl.X - 2, bl.Y - 2);
      const dustIdx = Terraria.Dust.NewDust(dustPos, player.width + 4, 4, 222, 0, 0, 100, ThoriumPlayer._whiteColor, 1);
      const dust = Main.dust[dustIdx];
      if (dust) {
        dust.noGravity = true;
        dust.noLight = true;
        let dv = dust.velocity;
        dv.X = 0;
        dv.Y = 0;
        dust.velocity = dv;
      }
    }
  }

  OnPickup(player, item) {
    if (!WorldDB.has('Thorium:CanSpawnTownNPC_Cobbler') && ThoriumPlayer.COBBLER_ITEMS.has(item.type)) {
      WorldDB.set('Thorium:CanSpawnTownNPC_Cobbler', true);
    }
  }

  OnConsumeMana(player, item, manaConsumed) {
    ThoriumPlayer.resLastManaSpent = manaConsumed
  }

  static MiniCriticalDamage(npc, damage) {
    npc[StrikeNPCNoInteraction](Math.round(damage * 0.75), 0, npc.direction ?? 1, true, false, false);
  }

  static IsCriticalDamage(item, damageDone) {
    return damageDone >= item.damage * 1.60;
  }

  static EnterCombat() {
    ThoriumPlayer.InCombat = true;
    ThoriumPlayer.CombatTimer = 0;
  }

  static ApplySoulEssenceEffect(player) {
    const healV = ThoriumPlayer.HealHPInHealerClass(player, 1)
    const manaV = healV * 3

    player.statMana += manaV;
    player.ManaEffect(manaV)
    ThoriumPlayer.soulEssenceReady = false;
  }

  static HealHPInHealerClass(player, value) {
    if (value <= 0) return 0;
    const mult = this.class.Healer.healPowerMultiply;
    const extra = this.class.Healer.healPowerExtraValue;
    const v = Math.max(1, value * mult + extra)
    player.Heal(v);

    return v
  }

  static AddInspirationToPlayer(player, value = 1, hide = false) {
    if (player && player.active && !player.dead) {
      if (!hide) {
        Terraria.CombatText['int NewText(Rectangle location, Color color, int amount, bool dramatic, bool dot)'](
          Rectangle.new(player.position.X, player.position.Y, player.width, player.height),
          ThoriumPlayer._bardHealColor,
          value,
          false,
          false
        );

        const curr = PlayerDB.get("Inspiration")
        PlayerDB.set("Inspiration", curr + value)
      }
    }
  }

  static TriggerNoviceClericCross(npc) {
    for (const id of ThoriumPlayer.NoviceClericCrossIds) {
      const p = Terraria.Main.projectile[id];
      if (!p || !p.active) { ThoriumPlayer.NoviceClericCrossIds.delete(id); continue; }
      const pai = new ProjAI(p, false);
      if (pai[0] === 0) {
        pai[0] = 1;
        pai[1] = npc.whoAmI;
        break;
      }
    }
  }

  static ReadySeathEffect(player) {
    const numDusts = 36;
    const baseSpeed = 7;

    for (let i = 0; i < numDusts; i++) {
      const angle = (i / numDusts) * Math.PI * 2;
      const speedVariation = baseSpeed + (Rand.NextFloat() * 2.0 - 1.0);
      let dustIndex = Terraria.Dust.NewDust(player.Center, 0, 0, 228, 0, 0, 50, ThoriumPlayer._whiteColor, 2.0 + (Rand.NextFloat() * 0.6));
      let d = Terraria.Main.dust[dustIndex];
      if (d) {
        d.noGravity = true;
        d.rotation = angle;
        ThoriumPlayer._vec.X = Math.cos(angle) * speedVariation;
        ThoriumPlayer._vec.Y = Math.sin(angle) * speedVariation;
        d.velocity = ThoriumPlayer._vec;
      }
    }

    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      let dustIndex = Terraria.Dust.NewDust(player.Center, 0, 0, 228, 0, 0, 100, ThoriumPlayer._whiteColor, 1.3 + (Rand.NextFloat() * 0.4));
      let d = Terraria.Main.dust[dustIndex];
      if (d) {
        d.noGravity = true;
        ThoriumPlayer._vec.X = Math.cos(angle) * (baseSpeed * 0.35);
        ThoriumPlayer._vec.Y = Math.sin(angle) * (baseSpeed * 0.35);
        d.velocity = ThoriumPlayer._vec;
      }
    }
  }

  static getCachedBardItem(player) {
    const type = player.HeldItem?.type ?? -1;
    if (type !== ThoriumPlayer._cachedHeldType) {
      ThoriumPlayer._cachedHeldType = type;
      ThoriumPlayer._cachedBardItem = ModBardItem.bardItemsName.has(type)
        ? ModBardItem.getModItem(type)
        : null;
    }
    return ThoriumPlayer._cachedBardItem;
  }

  static LuckyRabbitsFootSpawnCoins(npc) {
    const COPPER = ItemID.CopperCoin;
    const SILVER = ItemID.SilverCoin;
    const GOLD = ItemID.GoldCoin;
    const PLAT = ItemID.PlatinumCoin;

    let value = npc.value;
    const plat = Math.floor(value / 1000000); value %= 1000000;
    const gold = Math.floor(value / 10000); value %= 10000;
    const silver = Math.floor(value / 100); value %= 100;
    const copper = value;

    const x = npc.position.X, y = npc.position.Y, w = npc.width, h = npc.height;
    if (plat > 0) NewItem(x, y, w, h, PLAT, plat, false, 0, false);
    if (gold > 0) NewItem(x, y, w, h, GOLD, gold, false, 0, false);
    if (silver > 0) NewItem(x, y, w, h, SILVER, silver, false, 0, false);
    if (copper > 0) NewItem(x, y, w, h, COPPER, copper, false, 0, false);
  } a

  static CrietzProjectile(player, npc) {
    if (ThoriumPlayer._crietzProType === -1) {
      ThoriumPlayer._crietzProType = ModProjectile.getTypeByName('CrietzPro');
    }
    const speed = 2;
    const count = Rand.Next(2, 4);
    const baseDirX = 0, baseDirY = -1;
    for (let i = 0; i < count; i++) {
      const angle = (Rand.NextFloat() < 0.5 ? -1 : 1) * (0.3 + Rand.NextFloat() * 0.3);
      const cos = Math.cos(angle), sin = Math.sin(angle);
      // Rotaciona (0,-1) pelo ângulo
      const dirX = baseDirX * cos - baseDirY * sin;
      const dirY = baseDirX * sin + baseDirY * cos;
      ThoriumPlayer._vec.X = dirX * speed;
      ThoriumPlayer._vec.Y = dirY * speed;
      const damage = player.HeldItem != null ? player.HeldItem.damage : 10;
      const source = player.GetProjectileSource_Item(player.HeldItem);
      NewProjectile(source, npc.Center, ThoriumPlayer._vec, ThoriumPlayer._crietzProType, damage, 4, player.whoAmI, 0, 0, 0, null);
    }
    ThoriumPlayer.CrietzInvoke = false;
  }

  static SpawnFabergeEgg(player, npc) {
    if (ThoriumPlayer._fabergeEggProType === -1) {
      ThoriumPlayer._fabergeEggProType = ModProjectile.getTypeByName('FabergeEggPro');
    }

    const speed = 1.5 + Rand.NextFloat() * 1.0;
    const angle = Rand.NextFloat() * Math.PI * 2;
    ThoriumPlayer._vec2.X = Math.cos(angle) * speed;
    ThoriumPlayer._vec2.Y = Math.sin(angle) * speed;
    const source = Terraria.Projectile.GetNoneSource();
    NewProjectile(source, npc.Center, ThoriumPlayer._vec2, ThoriumPlayer._fabergeEggProType, 0, 0, player.whoAmI, 0, 0, 0, null);
    ThoriumPlayer.FabergeEggDelay = ThoriumPlayer.FabergeEggMaxDelay;
  }

  // ---- Bard UI & Inspiration ----

  static UpdateInspiration() {
    const CurrentInspiration = PlayerDB.get("Inspiration") || 0;
    const PreviousInspiration = ThoriumPlayer.PreviousInspiration;
    const InspirationMax = PlayerDB.get("InspirationMax") + ThoriumPlayer.class.Bard.inspirationMax2;

    if (CurrentInspiration > InspirationMax) {
      PlayerDB.set("Inspiration", InspirationMax);
    }

    if (CurrentInspiration < PreviousInspiration) {
      ThoriumPlayer.RegenCooldown = 60;
      ThoriumPlayer.class.Bard.inspirationRegenTimer = 0;
      ThoriumPlayer.class.Bard.inspirationRegenBase = 1;
      ThoriumPlayer.num1 = 0;
    }

    ThoriumPlayer.PreviousInspiration = CurrentInspiration;

    if (ThoriumPlayer.RegenCooldown > 0) {
      ThoriumPlayer.RegenCooldown--;
      return;
    }

    if (CurrentInspiration < InspirationMax) {
      const timer = ThoriumPlayer.class.Bard.inspirationRegenTimer;
      const regenBase = ThoriumPlayer.class.Bard.inspirationRegenBase;
      const regenBonus = ThoriumPlayer.class.Bard.inspirationRegenBonus;

      if (timer < 10) {
        ThoriumPlayer.class.Bard.inspirationRegenTimer += (regenBase + ThoriumPlayer.num1) * regenBonus;
      } else {
        ThoriumPlayer.class.Bard.inspirationRegenTimer = 0;
        PlayerDB.set("Inspiration", CurrentInspiration + 1);
        if (ThoriumPlayer.num1 < 5.0) ThoriumPlayer.num1 += 0.15;
      }
    }
  }

  static ResetResources() {
    ThoriumPlayer.resLastManaSpent = 0;
    ThoriumPlayer.resLastInspirationSpent = 0;
    ThoriumPlayer.resTimeCount = 0;
  }

  static RegenFabergeEggRes(player) {
    const Mana15Perc = Math.round(ThoriumPlayer.resLastManaSpent * 0.15)
    const Insp15Perc = Math.round(ThoriumPlayer.resLastInspirationSpent * 0.15)

    if (ThoriumPlayer.resLastManaSpent) player.ManaEffect(Math.max(1, Mana15Perc))
    player.statMana += Mana15Perc

    if (ThoriumPlayer.resLastInspirationSpent) ThoriumPlayer.AddInspirationToPlayer(player, Math.max(1, Insp15Perc))

    ThoriumPlayer.resTimeCount = ThoriumPlayer.resTimeMax;
    ThoriumPlayer.resLastManaSpent = 0
    ThoriumPlayer.resLastInspirationSpent = 0
  }

  static _getCachedBardItem(type) {
    if (!ThoriumPlayer._bardItemCache.has(type)) {
      ThoriumPlayer._bardItemCache.set(type, ModBardItem.getModItem(type));
    }
    return ThoriumPlayer._bardItemCache.get(type);
  }

  static UpdateTimer() {
    const player = Main.player[Main.myPlayer];
    if (!player) return;
    const held = player.HeldItem;
    const isBardItem = held && ModBardItem.bardItemsName.has(held.type);

    if (isBardItem) {
      const modItem = ThoriumPlayer._getCachedBardItem(held.type);
      if (modItem?.useTimer && modItem.timerStyle) {
        if (!BardTimer.Active || BardTimer.Style !== modItem.timerStyle) {
          BardTimer.Start(modItem.timerStyle);
        }
      } else {
        if (BardTimer.Active) BardTimer.Stop();
      }
    } else {
      if (BardTimer.Active) BardTimer.Stop();
    }

    BardTimer.Update();
  }

  static DrawFrame(column, row, x, y, color = ThoriumPlayer._whiteColor, scale = 1) {
    if (!ThoriumPlayer._wheelSpriteFrame) {
      ThoriumPlayer._wheelSpriteFrame = SpriteFrame.new();
      ThoriumPlayer._wheelSpriteFrame['void .ctor(byte columns, byte rows)'](7, 10);
    }
    const sprite = ThoriumPlayer._wheelSpriteFrame;
    sprite.CurrentColumn = column;
    sprite.CurrentRow = row;
    const frame = sprite.GetSourceRectangle(ThoriumPlayer.SpriteSheet);

    ThoriumPlayer._vec.X = x;
    ThoriumPlayer._vec.Y = y;

    Main.spriteBatch[
      "void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)"
    ](ThoriumPlayer.SpriteSheet, ThoriumPlayer._vec, frame, color, 0, Vector2.Zero, scale, null, 0.0);
  }

  static DrawBaseFrames(scale = 1.5) {
    const { X: PosX, Y: PosY } = ThoriumPlayer.GetWheelPosition();
    for (let row = 0; row < 8; row++) {
      ThoriumPlayer.DrawFrame(0, row, PosX, PosY, ThoriumPlayer._whiteColor, scale);
    }
  }

  static JesterEffect(player) {
    const bellType = ModProjectile.getTypeByName('JesterBellPro');
    if (bellType <= 0) return;

    Terraria.Projectile[
      'int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'
    ](
      player.GetProjectileSource_SetBonus(bellType),
      player.Center,
      Vector2.Zero,
      bellType,
      0,
      0,
      player.whoAmI,
      0, 0, 0, null
    );
  }

  static DrawInspirationFrames(scale = 1.5) {
    const { X: PosX, Y: PosY } = ThoriumPlayer.GetWheelPosition();
    const RealInspiration = PlayerDB.get("Inspiration") || 0;

    const speed = 0.25;
    if (RealInspiration < ThoriumPlayer.DisplayInspiration) {
      ThoriumPlayer.DisplayInspiration = RealInspiration;
    } else {
      ThoriumPlayer.DisplayInspiration += (RealInspiration - ThoriumPlayer.DisplayInspiration) * speed;
    }

    const inspiration = ThoriumPlayer.DisplayInspiration;
    const totalFrames = inspiration / 2;
    let fullFrames = Math.floor(totalFrames);
    const fraction = totalFrames - fullFrames;
    let col = 2;

    while (fullFrames >= 10 && col <= 6) {
      for (let i = 0; i < 10; i++) ThoriumPlayer.DrawFrame(col, i, PosX, PosY, ThoriumPlayer._whiteColor, scale);
      fullFrames -= 10;
      col++;
    }

    for (let i = 0; i < fullFrames; i++) {
      ThoriumPlayer.DrawFrame(col, i, PosX, PosY, ThoriumPlayer._whiteColor, scale);
    }

    if (fraction > 0 && fullFrames < 10) {
      const multi = Math.round(255 * fraction);
      ThoriumPlayer._color.R = multi; ThoriumPlayer._color.G = multi; ThoriumPlayer._color.B = multi; ThoriumPlayer._color.A = 255;
      ThoriumPlayer.DrawFrame(col, fullFrames, PosX, PosY, ThoriumPlayer._color, scale);
    }
  }

  static GetWheelPosition() {
    if (ThoriumPlayer._wheelPosCacheTimer++ < 60) {
      return ThoriumPlayer._cachedWheelPos;
    }
    ThoriumPlayer._wheelPosCacheTimer = 0;

    const uiScale = Main.UIScale;
    const slotSize = 40 * uiScale;

    const hotbar = Hotbar_Layout.InstanceNormal;
    const hotbarGrid = hotbar.HotbarGrid;

    const hotbarPos = LayoutCalculator.GetAnchoredPosition(
      hotbarGrid.FirstAnchorControl,
      hotbarGrid.FirstItemAnchor,
      hotbarGrid.FirstItemLocation
    );

    const columns = hotbarGrid.ItemLineCount;
    const hotbarWidth = columns * slotSize;

    const posX = (hotbarPos.X * uiScale) + hotbarWidth + 40;
    const posY = hotbarPos.Y * uiScale + 80 * uiScale;

    ThoriumPlayer._cachedWheelPos = { X: posX, Y: posY };
    return ThoriumPlayer._cachedWheelPos;
  }

  static BardWheel() {
    if (Main.gameMenu) return;
    if (!ThoriumPlayer.SpriteSheet) {
      ThoriumPlayer.SpriteSheet = tl.texture.load('Textures/UI/Bard/BardWheel_Sheet.png');
    }

    const scale = 1 / Main.UIScale;
    ThoriumPlayer.DrawBaseFrames(scale);
    ThoriumPlayer.DrawInspirationFrames(scale);
  }

  static UpdateClassItemsCrit(player) {
    const item = player.HeldItem;
    const type = item.type;
    const crit = item.crit;

    if (ModBardItem.bardItemsName.has(type)) {
      ThoriumPlayer.class.Bard.symphonicCrit += crit
    }

    if (ModHealerItem.healerItemsName.has(type)) {
      ThoriumPlayer.class.Healer.radiantCrit += crit
    }
  }
}