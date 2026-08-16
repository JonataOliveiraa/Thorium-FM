import { Terraria } from '../TL/ModImports.js';
import { ModItem } from '../TL/ModItem.js';
import { ModBuff } from '../TL/ModBuff.js';
import { ThoriumPlayer } from '../Content/Global/ThoriumPlayer.js';

const { BuffID, ItemID, ItemUseStyleID, SoundID } = Terraria.ID;
const DrawAnimationVertical = new NativeClass('Terraria.DataStructures', 'DrawAnimationVertical');

export const FULL_STOMACH_DURATION = 2700; // 45s
export const SECONDARY_DURATION = 3600;    // 60s
export const WELL_FED_BASIC = 7200;        // 2min - comida basica da loja
export const WELL_FED_RECIPE = 18000;      // 5min - comida de receita

const FOOD_FRAMES = 3;
const NEVER_ADVANCE = 2147483647;

let fullStomachType = -1;

export class ModCookFood extends ModItem {
  constructor() {
    super();
    this.ResearchUnlockCount = 30;
    this.foodHealLife = 50;
    this.foodHealMana = 0;
    this.wellFedType = BuffID.WellFed;
    this.wellFedDuration = WELL_FED_BASIC;
    this.fullStomachDuration = FULL_STOMACH_DURATION;
    this.secondaryBuff = 0;
    this.secondaryDuration = SECONDARY_DURATION;
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
    Terraria.Main.RegisterItemAnimation(this.Type, animation);

    this.CookStaticDefaults();
  }

  CookStaticDefaults() { }

  SetDefaults() {
    this.Item.useTime = 17;
    this.Item.useAnimation = 17;
    this.Item.useStyle = ItemUseStyleID.EatFood;
    this.Item.UseSound = SoundID.Item2;
    this.Item.useTurn = true;
    this.Item.consumable = true;
    this.Item.maxStack = 9999;
    this.Item.noMelee = true;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 2, 0);

    this.CookDefaults();

    this.Item.buffType = this.wellFedType;
    this.Item.buffTime = this.wellFedDuration;
  }

  CookDefaults() { }

  UseItem(item, player) {
    if (this.foodHealLife > 0) player.HealLife(this.foodHealLife);
    if (this.foodHealMana > 0) player.HealMana(this.foodHealMana);
    if (this.secondaryBuff > 0) player.AddBuff(this.secondaryBuff, this.secondaryDuration, false);

    const stomach = ModCookFood.FullStomachType();
    if (stomach > 0) player.AddBuff(stomach, this.fullStomachDuration, false);

    this.OnEat(player);

    if (ThoriumPlayer.InCombat) return false;

    if (stomach > 0 && player.FindBuffIndex(stomach) >= 0) return false;

    return true;
  }

  OnEat(player) { }
}
