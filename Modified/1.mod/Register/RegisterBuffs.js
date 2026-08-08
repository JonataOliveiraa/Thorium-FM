import { ModBuff } from '../TL/ModBuff.js';

import { LivingWoodAcornBuff } from "../Content/Buffs/LivingWoodAcornBuff.js";
import { PrehistoricAmberStaffBuff } from "../Content/Buffs/PrehistoricAmberStaffBuff.js";
import { ElementalDecayBuff } from "../Content/Buffs/ElementalDecayBuff.js";
import { LifeRecoveryBuff } from "../Content/Buffs/Healer/LifeRecoveryBuff.js";
import { StunnedBuff } from "../Content/Buffs/StunnedBuff.js";
import { LavaHugBuff } from "../Content/Buffs/LavaHugBuff.js";
import { EnchantedCaneBuff } from "../Content/Buffs/EnchantedCaneBuff.js";
import { CharmedBuff } from "../Content/Buffs/CharmedBuff.js";
import { HatclingBuff } from "../Content/Buffs/HatclingBuff.js";
import { BubbledBuff } from "../Content/Buffs/BubbledBuff.js";

// Mounts
import { MagmaCharmBuff } from "../Content/Buffs/Mounts/MagmaCharmBuff.js";
import { SpiritsGraceBuff } from '../Content/Buffs/SpiritsGraceBuff.js';
import { SeahorseWandBuff } from '../Content/Buffs/SeahorseWandBuff.js';
import { OvergrowthBuff } from '../Content/Buffs/Healer/OvergrowthBuff.js';
import { SingedBuff } from '../Content/Buffs/SingedBuff.js';
import { SheathBuff } from '../Content/Buffs/SheathBuff.js';
import { SoulEssenceBuff } from '../Content/Buffs/SoulEssenceBuff.js';
import { DistortedTimeEnemy } from '../Content/Buffs/DistortedTimeEnemy.js';
import { VampiresCurseBuff } from '../Content/Buffs/VampiresCurseBuff.js';
import { ViscountCaneBuff } from '../Content/Buffs/ViscountCaneBuff.js';
import { PearlPikeBuff } from '../Content/Buffs/PearlPikeBuff.js';
import { MeteorHeadStaffBuff } from '../Content/Buffs/MeteorHeadStaffBuff.js';
import { GraniteSurgeBuff } from '../Content/Buffs/GraniteSurgeBuff.js';
import { BloomBoostBuff } from '../Content/Buffs/BloomBoostBuff.js';

const List = [
    LivingWoodAcornBuff,
    PrehistoricAmberStaffBuff,
    ElementalDecayBuff,
    LifeRecoveryBuff,
    OvergrowthBuff,
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
    GraniteSurgeBuff
]

export function RegisterBuffs() {
    for (const Buff of List) {
        ModBuff.register(Buff)
    }
}