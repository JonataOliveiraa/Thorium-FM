import { ModNPC } from '../TL/ModNPC.js';

// Town NPCs
import { Blacksmith } from '../Content/NPCs/Town/Blacksmith.js';
import { DesertAcolyte } from '../Content/NPCs/Town/DesertAcolyte.js';

// Surface
import { Biter } from '../Content/NPCs/Surface/Biter.js';

// Jungle
import { ArmyAnt } from '../Content/NPCs/Jungle/ArmyAnt.js';
import { FireAnt } from '../Content/NPCs/Jungle/FireAnt.js';
import { StrangeBulb } from '../Content/NPCs/Jungle/StrangeBulb.js';
import { MahoganyEnt } from '../Content/NPCs/Jungle/MahoganyEnt.js';

// Cavern
import { EarthenGolem } from '../Content/NPCs/Cavern/EarthenGolem.js';
import { EarthenBat } from '../Content/NPCs/Cavern/EarthenBat.js';
import { GildedBat } from '../Content/NPCs/Cavern/GildedBat.js';
import { GildedSlime } from '../Content/NPCs/Cavern/GildedSlime.js';
import { GildedSlimeling } from '../Content/NPCs/Cavern/GildedSlimeling.js';
import { GildedLycan } from '../Content/NPCs/Cavern/GildedLycan.js';

// Crimson
import { LivingHemorrage } from '../Content/NPCs/Crimson/LivingHemorrage.js';
import { Clot } from '../Content/NPCs/Crimson/Clot.js';

// Corruption
import { TheInnocent } from '../Content/NPCs/Corruption/TheInnocent.js';

// Aquatic Depths
import { ManofWar } from '../Content/NPCs/AquaticDepths/ManofWar.js';
import { Sharptooth } from '../Content/NPCs/AquaticDepths/Sharptooth.js';
import { Hammerhead } from '../Content/NPCs/AquaticDepths/Hammerhead.js';

// Blood Moon
import { GorgedEye } from '../Content/NPCs/BloodMoon/GorgedEye.js';
import { GraveLimb } from '../Content/NPCs/BloodMoon/GraveLimb.js';
import { PatchWerk } from '../Content/NPCs/BloodMoon/PatchWerk.js';
import { Abomination } from '../Content/NPCs/BloodMoon/Abomination.js';
import { FamishedMaggot } from '../Content/NPCs/BloodMoon/FamishedMaggot.js';
import { BloodDrop } from '../Content/NPCs/BloodMoon/BloodDrop.js';
import { SeveredLegs } from '../Content/NPCs/BloodMoon/SeveredLegs.js';

// Thunder Bird
import { StormHatchling } from '../Content/NPCs/Boss/StormHatchling.js';
import { TheGrandThunderBird } from '../Content/NPCs/Boss/TheGrandThunderBird.js';

// Queen Jellyfish
import { ZealousJellyfish } from '../Content/NPCs/Boss/QueenJellyfish/ZealousJellyfish.js';
import { SpittingJellyfish } from '../Content/NPCs/Boss/QueenJellyfish/SpittingJellyfish.js';
import { DistractingJellyfish } from '../Content/NPCs/Boss/QueenJellyfish/DistractingJellyfish.js';
import { QueenJellyfish } from '../Content/NPCs/Boss/QueenJellyfish/QueenJellyfish.js';
import { CoinBagCopper } from '../Content/NPCs/Cavern/CoinBagCopper.js';
import { CoinBagSilver } from '../Content/NPCs/Cavern/CoinBagSilver.js';
import { CoinBagGold } from '../Content/NPCs/Cavern/CoinBagGold.js';
import { BatOutaHell } from '../Content/NPCs/Cavern/BatOutaHell.js';
import { FlamekinCaster } from '../Content/NPCs/Cavern/FlamekinCaster.js';
import { ConfusedZombie } from '../Content/NPCs/Town/ConfusedZombie.js';
import { Cobbler } from '../Content/NPCs/Town/Cobbler.js';

const List = [
    Blacksmith,
    DesertAcolyte,
    ConfusedZombie,
    Cobbler,

    Biter,

    ArmyAnt,
    FireAnt,
    StrangeBulb,
    MahoganyEnt,

    EarthenGolem,
    EarthenBat,
    BatOutaHell,
    FlamekinCaster,
    GildedBat,
    GildedSlime,
    GildedSlimeling,
    GildedLycan,

    LivingHemorrage,
    Clot,

    TheInnocent,

    ManofWar,
    Sharptooth,
    Hammerhead,

    GorgedEye,
    GraveLimb,
    PatchWerk,
    Abomination,
    FamishedMaggot,
    BloodDrop,
    SeveredLegs,

    StormHatchling,
    TheGrandThunderBird,

    ZealousJellyfish,
    SpittingJellyfish,
    DistractingJellyfish,
    QueenJellyfish,

    CoinBagCopper,
    CoinBagSilver,
    CoinBagGold,
]

export function RegisterNPCs() {
    for (const NPC of List) {
        ModNPC.register(NPC)
    }
}