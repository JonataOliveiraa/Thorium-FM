import { Terraria } from '../TL/ModImports.js';
import { ModItem } from '../TL/ModItem.js';
import { ModBuff } from '../TL/ModBuff.js';
import { ThoriumPlayer } from '../Content/Global/ThoriumPlayer.js';

const { ItemID, SoundID } = Terraria.ID;
const { Main } = Terraria;
const DrawAnimationVertical = new NativeClass('Terraria.DataStructures', 'DrawAnimationVertical');

export const FULL_STOMACH_DURATION = 2700;
export const SECONDARY_DURATION = 3600;
export const WELL_FED_BASIC = 7200;
export const WELL_FED_RECIPE = 18000;

const FOOD_FRAMES = 3;
const NEVER_ADVANCE = 2147483647;

let fullStomachType = -1;

export class ModCookFood extends ModItem {
  constructor() {
    super();
    this.ResearchUnlockCount = 30;
    this.foodHealLife = 50;
    this.foodHealMana = 0;
    this.wellFedType = 26;
    this.wellFedDuration = WELL_FED_BASIC;
    this.fullStomachDuration = FULL_STOMACH_DURATION;
    this.secondaryBuff = 0;
    this.secondaryDuration = SECONDARY_DURATION;
    this.isDrink = false;
    this.ignoresCombat = false;
  }

  static FullStomachType() {
    if (fullStomachType === -1) fullStomachType = Number(ModBuff.getTypeByName('FullStomach') ?? -2);
    return fullStomachType;
  }

  SetStaticDefaults() {
    ItemID.Sets.IsFood[this.Type] = true;

    const animation = DrawAnimationVertical.new();
    try {
      animation['void .ctor(int ticksPerFrame, int frameCount, bool pingPong)'](NEVER_ADVANCE, FOOD_FRAMES, false);
    } catch (_) {
      animation.Frame = 0;
      animation.FrameCounter = 0;
      animation.FrameCount = FOOD_FRAMES;
      animation.TicksPerFrame = NEVER_ADVANCE;
      animation.PingPong = false;
    }
    Main.RegisterItemAnimation(this.Type, animation);

    this.CookStaticDefaults();
  }

  CookStaticDefaults() { }

  SetDefaults() {
    this.Item.useTime = 17;
    this.Item.useAnimation = 17;
    this.Item.useTurn = true;
    this.Item.consumable = true;
    this.Item.maxStack = 9999;
    this.Item.noMelee = true;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 2, 0);

    this.CookDefaults();

    if (this.isDrink) {
      this.Item.useStyle = 9;
      this.Item.UseSound = SoundID.Item3;
    } else {
      this.Item.useStyle = 2;
      this.Item.UseSound = SoundID.Item2;
    }
  }

  CookDefaults() { }

  CanUseItem(item, player) {
    const stomach = ModCookFood.FullStomachType();
    if (stomach > 0 && player.FindBuffIndex(stomach) >= 0) return false;
    if (!this.ignoresCombat && ThoriumPlayer.InCombat) return false;
    return true;
  }

  OnConsumeItem(item, player) {
    if (this.foodHealLife > 0) player.Heal(this.foodHealLife);

    if (this.foodHealMana > 0) {
      const missing = player.statManaMax2 - player.statMana;
      const restored = Math.min(this.foodHealMana, Math.max(0, missing));
      if (restored > 0) {
        player.statMana += restored;
        player.ManaEffect(restored);
      }
    }

    if (this.secondaryBuff > 0) player.AddBuff(this.secondaryBuff, this.secondaryDuration, false);

    this.ApplyWellFed(player);
    this.OnEat(player);

    const stomach = ModCookFood.FullStomachType();
    if (stomach > 0) player.AddBuff(stomach, this.fullStomachDuration, false);
  }

  ApplyWellFed(player) {
    if (this.wellFedType <= 0 || this.wellFedDuration <= 0) return;

    const tiers = [26, 206, 207];
    let activeTier = -1;
    let activeIndex = -1;

    for (let i = tiers.length - 1; i >= 0; i--) {
      const index = player.FindBuffIndex(tiers[i]);
      if (index > -1) {
        activeTier = i;
        activeIndex = index;
        break;
      }
    }

    const myTier = tiers.indexOf(this.wellFedType);
    if (myTier < activeTier) return;

    let duration = this.wellFedDuration;
    if (activeIndex > -1 && myTier === activeTier) {
      const remaining = player.buffTime[activeIndex];
      if (remaining > duration) duration = remaining;
    }

    player.AddBuff(this.wellFedType, duration, false);
  }

  OnEat(player) { }
}
