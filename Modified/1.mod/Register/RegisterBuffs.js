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

// Mounts
import { MagmaCharmBuff } from "../Content/Buffs/Mounts/MagmaCharmBuff.js";

const List = [
    LivingWoodAcornBuff,
    PrehistoricAmberStaffBuff,
    ElementalDecayBuff,
    LifeRecoveryBuff,
    StunnedBuff,
    LavaHugBuff,
    EnchantedCaneBuff,
    CharmedBuff,
    HatclingBuff,
    MagmaCharmBuff
]

export function RegisterBuffs() {
    for (const Buff of List) {
        ModBuff.register(Buff)
    }
}