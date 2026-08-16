import { ModBuff } from "../TL/ModBuff.js";

import { LivingWoodAcornBuff } from "../Content/Buffs/LivingWoodAcornBuff.js";
import { PrehistoricAmberStaffBuff } from "../Content/Buffs/PrehistoricAmberStaffBuff.js";
import { ElementalDecayBuff } from "../Content/Buffs/ElementalDecayBuff.js";
import { LifeRecoveryBuff } from "../Content/Buffs/Healer/LifeRecoveryBuff.js";
import { StunnedBuff } from "../Content/Buffs/StunnedBuff.js";
import { PetrifyBuff } from "../Content/Buffs/PetrifyBuff.js";
import { LavaHugBuff } from "../Content/Buffs/LavaHugBuff.js";
import { EnchantedCaneBuff } from "../Content/Buffs/EnchantedCaneBuff.js";
import { CharmedBuff } from "../Content/Buffs/CharmedBuff.js";
import { HatclingBuff } from "../Content/Buffs/HatclingBuff.js";
import { BubbledBuff } from "../Content/Buffs/BubbledBuff.js";

// Mounts
import { MagmaCharmBuff } from "../Content/Buffs/Mounts/MagmaCharmBuff.js";
import { SpiritsGraceBuff } from "../Content/Buffs/SpiritsGraceBuff.js";
import { SeahorseWandBuff } from "../Content/Buffs/SeahorseWandBuff.js";
import { OvergrowthBuff } from "../Content/Buffs/Healer/OvergrowthBuff.js";
import { SingedBuff } from "../Content/Buffs/SingedBuff.js";
import { SheathBuff } from "../Content/Buffs/SheathBuff.js";
import { SoulEssenceBuff } from "../Content/Buffs/SoulEssenceBuff.js";
import { DistortedTimeEnemy } from "../Content/Buffs/DistortedTimeEnemy.js";
import { VampiresCurseBuff } from "../Content/Buffs/VampiresCurseBuff.js";
import { ViscountCaneBuff } from "../Content/Buffs/ViscountCaneBuff.js";
import { PearlPikeBuff } from "../Content/Buffs/PearlPikeBuff.js";
import { MeteorHeadStaffBuff } from "../Content/Buffs/MeteorHeadStaffBuff.js";
import { GraniteSurgeBuff } from "../Content/Buffs/GraniteSurgeBuff.js";
import { BloomBoostBuff } from "../Content/Buffs/BloomBoostBuff.js";
import { ShockAbsorberBuff } from "../Content/Buffs/Bard/ShockAbsorberBuff.js";
import { EnergizedQuadCubeBuff } from "../Content/Buffs/Pet/EnergizedQuadCubeBuff.js";
import { FullStomach } from "../Content/Buffs/FullStomach.js";

// Potions
import { AquaAffinityBuff } from "../Content/Buffs/Potions/AquaAffinityBuff.js";
import { ArcaneBuff } from "../Content/Buffs/Potions/ArcaneBuff.js";
import { BloodPotionBuff } from "../Content/Buffs/Potions/BloodPotionBuff.js";
import { CactusFruitBuff } from "../Content/Buffs/Potions/CactusFruitBuff.js";
import { CreativityBuff } from "../Content/Buffs/Potions/CreativityBuff.js";
import { EarwormBuff } from "../Content/Buffs/Potions/EarwormBuff.js";
import { FrenzyPotionBuff } from "../Content/Buffs/Potions/FrenzyPotionBuff.js";
import { GlowingBuff } from "../Content/Buffs/Potions/GlowingBuff.js";
import { HydrationBuff } from "../Content/Buffs/Potions/HydrationBuff.js";
import { RepellentBatsBuff } from "../Content/Buffs/Potions/RepellentBatsBuff.js";
import { RepellentFishBuff } from "../Content/Buffs/Potions/RepellentFishBuff.js";
import { RepellentInsectsBuff } from "../Content/Buffs/Potions/RepellentInsectsBuff.js";
import { RepellentSkeletonsBuff } from "../Content/Buffs/Potions/RepellentSkeletonsBuff.js";
import { RepellentZombiesBuff } from "../Content/Buffs/Potions/RepellentZombiesBuff.js";

const List = [
    LivingWoodAcornBuff,
    PrehistoricAmberStaffBuff,
    ElementalDecayBuff,
    LifeRecoveryBuff,
    OvergrowthBuff,
    PetrifyBuff,
    StunnedBuff,
    LavaHugBuff,
    EnchantedCaneBuff,
    CharmedBuff,
    HatclingBuff,
    BubbledBuff,
    SeahorseWandBuff,
    MagmaCharmBuff,
    SpiritsGraceBuff,
    SingedBuff,
    SheathBuff,
    SoulEssenceBuff,
    DistortedTimeEnemy,
    VampiresCurseBuff,
    ViscountCaneBuff,
    PearlPikeBuff,
    MeteorHeadStaffBuff,
    BloomBoostBuff,
    GraniteSurgeBuff,
    ShockAbsorberBuff,
    EnergizedQuadCubeBuff,
    FullStomach,

    // Potions
    AquaAffinityBuff,
    ArcaneBuff,
    BloodPotionBuff,
    CactusFruitBuff,
    CreativityBuff,
    EarwormBuff,
    FrenzyPotionBuff,
    GlowingBuff,
    HydrationBuff,
    RepellentBatsBuff,
    RepellentFishBuff,
    RepellentInsectsBuff,
    RepellentSkeletonsBuff,
    RepellentZombiesBuff
];

export function RegisterBuffs() {
    for (const Buff of List) {
        ModBuff.register(Buff);
    }
}
