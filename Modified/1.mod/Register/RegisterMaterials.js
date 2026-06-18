import { ModItem } from "../TL/ModItem.js";

// General
import { IcyShard } from "../Content/Items/Materials/IcyShard.js";
import { ThoriumBar } from "../Content/Items/Materials/ThoriumBar.js";
import { LivingLeaf } from "../Content/Items/Materials/LivingLeaf.js";
import { MarineKelp } from "../Content/Items/Materials/MarineKelp.js";
import { Petal } from "../Content/Items/Materials/Petal.js";
import { YewWood } from "../Content/Items/Materials/YewWood.js";
import { Blood } from "../Content/Items/Materials/Blood.js";
import { UnholyShards } from "../Content/Items/Materials/UnholyShards.js";
import { Talon } from "../Content/Items/Materials/Talon.js";

// Ore
import { ThoriumOre } from "../Content/Items/Materials/ThoriumOre.js";
import { LifeQuartzOre } from "../Content/Items/Materials/LifeQuartzOre.js";
import { AquaiteOre } from "../Content/Items/Materials/AquaiteOre.js";
import { AquamarineGem } from "../Content/Items/Materials/AquamarineGem.js";
import { OpalGem } from "../Content/Items/Materials/OpalGem.js";
import { SandstoneIngot } from "../Content/Items/Materials/SandstoneIngot.js";
import { PurifiedShards } from "../Content/Items/Materials/PurifiedShards.js";
import { Cloth } from "../Content/Items/Materials/Cloth.js";

const List = [
    IcyShard,
    ThoriumBar,
    LivingLeaf,
    MarineKelp,
    Petal,
    YewWood,
    Blood,
    UnholyShards,
    PurifiedShards,
    Talon,
    Cloth,

    ThoriumOre,
    LifeQuartzOre,
    AquaiteOre,
    AquamarineGem,
    OpalGem,
    SandstoneIngot,
]

export function RegisterMaterials() {
    for (const Material of List) {
        ModItem.register(Material)
    }
}