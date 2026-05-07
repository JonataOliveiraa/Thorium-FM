import { ModItem } from '../TL/ModItem.js';

// Icy Items
import { IceCube } from '../Content/Items/Icy/IceCube.js';
import { FrostFury } from '../Content/Items/Icy/FrostFury.js';
import { IcyArrow } from '../Content/Items/Icy/IcyArrow.js';
import { IcyAxe } from '../Content/Items/Icy/IcyAxe.js';
import { IcyPickaxe } from '../Content/Items/Icy/IcyPickaxe.js';
import { TheSnowball } from '../Content/Items/Icy/TheSnowball.js';
import { IcyHeadgear } from '../Content/Items/Icy/IcyHeadgear.js';
import { IcyMail } from '../Content/Items/Icy/IcyMail.js';
import { IcyGreaves } from '../Content/Items/Icy/IcyGreaves.js';

// LivingWood Items 
import { LivingWoodAcorn } from '../Content/Items/LivingWood/LivingWoodAcorn.js';
import { LivingWoodChestguard } from '../Content/Items/LivingWood/LivingWoodChestguard.js';
import { LivingWoodLeggings } from '../Content/Items/LivingWood/LivingWoodLeggings.js';
import { LivingWoodHelmet } from '../Content/Items/LivingWood/LivingWoodHelmet.js';
import { LivingWoodSap } from '../Content/Items/LivingWood/LivingWoodSap.js';

// Silk Items
import { SilkHat } from '../Content/Items/Silk/SilkHat.js';
import { SilkTabard } from '../Content/Items/Silk/SilkTabard.js';
import { SilkLeggings } from '../Content/Items/Silk/SilkLeggings.js';

// Thorium Items
import { ThoriumHelmet } from '../Content/Items/Thorium/ThoriumHelmet.js';
import { ThoriumMail } from '../Content/Items/Thorium/ThoriumMail.js';
import { ThoriumGreaves } from '../Content/Items/Thorium/ThoriumGreaves.js';
import { ThoriumBlade } from '../Content/Items/Thorium/ThoriumBlade.js';
import { ThoriumBoomerang } from '../Content/Items/Thorium/ThoriumBoomerang.js';
import { ThoriumStaff } from '../Content/Items/Thorium/ThoriumStaff.js';
import { ThoriumBow } from '../Content/Items/Thorium/ThoriumBow.js';
import { ThoriumSpear } from '../Content/Items/Thorium/ThoriumSpear.js';

// Basic Accessories
import { AmberRing } from '../Content/Items/BasicAccessories/Rings/AmberRing.js';
import { AmethystRing } from '../Content/Items/BasicAccessories/Rings/AmethystRing.js';
import { DiamondRing } from '../Content/Items/BasicAccessories/Rings/DiamondRing.js';
import { EmeraldRing } from '../Content/Items/BasicAccessories/Rings/EmeraldRing.js';
import { RubyRing } from '../Content/Items/BasicAccessories/Rings/RubyRing.js';
import { SapphireRing } from '../Content/Items/BasicAccessories/Rings/SapphireRing.js';
import { TheRing } from '../Content/Items/BasicAccessories/Rings/TheRing.js';
import { IncubatedEgg } from '../Content/Items/BasicAccessories/Summon/IncubatedEgg.js';
import { LuckyRabbitsFoot } from '../Content/Items/BasicAccessories/LuckyRabbitsFoot.js';
import { ManaBauble } from '../Content/Items/BasicAccessories/ManaBauble.js';
import { GiantShellSpine } from '../Content/Items/BasicAccessories/GiantShellSpine.js';
import { SalamanderEye } from '../Content/Items/BasicAccessories/SalamanderEye.js';
import { CrawdadClaw } from '../Content/Items/BasicAccessories/CrawdadClaw.js';
import { SoulStone } from '../Content/Items/BasicAccessories/Summon/SoulStone.js';
import { Crietz } from '../Content/Items/BasicAccessories/Crietz.js';

// Sheathes
import { LeatherSheath } from '../Content/Items/BasicAccessories/Sheathes/LeatherSheath.js';

// Depth
import { BubbleConch } from '../Content/Items/Depth/BubbleConch.js';
import { JellyfishResonator } from '../Content/Items/Consumable/JellyfishResonator.js';
import { RainStone } from '../Content/Items/Depth/RainStone.js';
import { DepthScales } from '../Content/Items/Materials/DepthScales.js';

// Mage
import { EnchantedStaff } from '../Content/Items/Mage/EnchantedStaff.js';
import { MagickStaff } from '../Content/Items/Mage/MagickStaff.js';

// Ranged
import { WebGun } from '../Content/Items/Ranged/WebGun.js';
import { BrambleShot } from '../Content/Items/Ranged/BrambleShot.js';

// Summon
import { PrehistoricAmberStaff } from '../Content/Items/Summon/PrehistoricAmberStaff.js';

// Shields
import { SeaTurtlesBulwark } from '../Content/Items/BasicAccessories/Shields/SeaTurtlesBulwark.js';
import { CopperBuckler } from '../Content/Items/BasicAccessories/Shields/CopperBuckler.js';
import { GoldAegis } from '../Content/Items/BasicAccessories/Shields/GoldAegis.js';
import { IronShield } from '../Content/Items/BasicAccessories/Shields/IronShield.js';
import { LeadShield } from '../Content/Items/BasicAccessories/Shields/LeadShield.js';
import { PlatinumAegis } from '../Content/Items/BasicAccessories/Shields/PlatinumAegis.js';
import { SilverBulwark } from '../Content/Items/BasicAccessories/Shields/SilverBulwark.js';
import { TinBuckler } from '../Content/Items/BasicAccessories/Shields/TinBuckler.js';
import { TungstenBulwark } from '../Content/Items/BasicAccessories/Shields/TungstenBulwark.js';

// Crystal Weapons
import { Dissolve } from '../Content/Items/Mage/Dissolve.js';
import { Freeze } from '../Content/Items/Mage/Freeze.js';
import { Ignite } from '../Content/Items/Mage/Ignite.js';
import { Poison } from '../Content/Items/Mage/Poison.js';
import { Siphon } from '../Content/Items/Mage/Siphon.js';
import { Charm } from '../Content/Items/Mage/Charm.js';
import { Stun } from '../Content/Items/Mage/Stun.js';

// Blooming
import { BloomingBlade } from '../Content/Items/ArcaneWeapon/BloomingBlade.js';
import { BloomingBow } from '../Content/Items/ArcaneWeapon/BloomingBow.js';
import { BloomingStaff } from '../Content/Items/ArcaneWeapon/BloomingStaff.js';

// Steel
import { SteelBlade } from '../Content/Items/Steel/SteelBlade.js';
import { SteelChestplate } from '../Content/Items/Steel/SteelChestplate.js';
import { SteelGreaves } from '../Content/Items/Steel/SteelGreaves.js';
import { SteelHelmet } from '../Content/Items/Steel/SteelHelmet.js';
import { SteelAxe } from '../Content/Items/Steel/SteelAxe.js';
import { SteelHammer } from '../Content/Items/Steel/SteelHammer.js';
import { SteelPickaxe } from '../Content/Items/Steel/SteelPickaxe.js';
import { SteelBow } from '../Content/Items/Steel/SteelBow.js';

// Enchanted Weapons
import { EnchantedCane } from '../Content/Items/Summon/EnchantedCane.js';

// Scarlet Chest
import { LootRang } from '../Content/Items/Melee/LootRang.js';
import { MagmaCharmItem } from '../Content/Items/Mounts/MagmaCharmItem.js';
import { MagmaLocket } from '../Content/Items/BasicAccessories/MagmaLocket.js';
import { SpringSteps } from '../Content/Items/BasicAccessories/Boots/SpringSteps.js';
import { DeepStaff } from '../Content/Items/Mage/DeepStaff.js';

// Robe
import { AquamarineRobe } from '../Content/Items/Mage/AquamarineRobe.js';
import { OpalRobe } from '../Content/Items/Mage/OpalRobe.js';

// Aquamarine & Opal
import { CyanPhaseblade } from '../Content/Items/Mage/CyanPhaseblade.js';
import { PinkPhaseblade } from '../Content/Items/Mage/PinkPhaseblade.js';
import { AquamarineStaff } from '../Content/Items/Mage/AquamarineStaff.js';

// Tiles
import { ThoriumAnvil } from '../Content/Items/Tile/ThoriumAnvil.js';

// Technique
import { TechniqueBlankScroll } from '../Content/Items/Materials/TechniqueBlankScroll.js';

// Thunder Bird
import { GrandFlareGun } from '../Content/Items/ThunderBird/GrandFlareGun.js';
import { StormFlare } from '../Content/Items/ThunderBird/StormFlare.js';
import { StormHatchlingStaff } from '../Content/Items/ThunderBird/StormHatchlingStaff.js';
import { TalonBurst } from '../Content/Items/ThunderBird/TalonBurst.js';
import { ThunderTalon } from '../Content/Items/ThunderBird/ThunderTalon.js';
import { ThunderBirdBag } from '../Content/Items/Consumable/ThunderBirdBag.js';
import { OpalStaff } from '../Content/Items/Mage/OpalStaff.js';
import { AquamarineRing } from '../Content/Items/BasicAccessories/Rings/AquamarineRing.js';
import { OpalRing } from '../Content/Items/BasicAccessories/Rings/OpalRing.js';
import { MoltenScale } from '../Content/Items/BasicAccessories/Shields/MoltenScale.js';

// Register all items

const List = [
    IceCube,
    FrostFury,
    IcyArrow,
    IcyAxe,
    IcyPickaxe,
    TheSnowball,
    IcyHeadgear,
    IcyMail,
    IcyGreaves,

    LivingWoodAcorn,
    LivingWoodChestguard,
    LivingWoodLeggings,
    LivingWoodHelmet,
    LivingWoodSap,

    SilkHat,
    SilkTabard,
    SilkLeggings,

    ThoriumHelmet,
    ThoriumMail,
    ThoriumGreaves,
    ThoriumBlade,
    ThoriumBoomerang,
    ThoriumStaff,
    ThoriumBow,
    ThoriumSpear,

    AmberRing,
    AmethystRing,
    DiamondRing,
    EmeraldRing,
    RubyRing,
    SapphireRing,
    TheRing,
    AquamarineRing,
    OpalRing,
    IncubatedEgg,
    LuckyRabbitsFoot,
    ManaBauble,
    GiantShellSpine,
    SalamanderEye,
    CrawdadClaw,
    SoulStone,
    Crietz,

    LeatherSheath,

    BubbleConch,
    JellyfishResonator,
    RainStone,
    DepthScales,

    EnchantedStaff,
    MagickStaff,

    WebGun,
    BrambleShot,

    PrehistoricAmberStaff,

    SeaTurtlesBulwark,
    CopperBuckler,
    GoldAegis,
    IronShield,
    LeadShield,
    PlatinumAegis,
    SilverBulwark,
    TinBuckler,
    TungstenBulwark,
    MoltenScale,

    Dissolve,
    Freeze,
    Ignite,
    Poison,
    Siphon,
    Charm,
    Stun,

    BloomingBlade,
    BloomingBow,
    BloomingStaff,

    SteelBlade,
    SteelChestplate,
    SteelGreaves,
    SteelHelmet,
    SteelAxe,
    SteelHammer,
    SteelPickaxe,
    SteelBow,

    EnchantedCane,

    LootRang,
    MagmaCharmItem,
    MagmaLocket,
    SpringSteps,
    DeepStaff,

    AquamarineRobe,
    OpalRobe,

    CyanPhaseblade,
    PinkPhaseblade,
    AquamarineStaff,
    OpalStaff,

    ThoriumAnvil,

    TechniqueBlankScroll,

    GrandFlareGun,
    StormFlare,
    StormHatchlingStaff,
    TalonBurst,
    ThunderTalon,
    ThunderBirdBag
]

export function RegisterItems() {
    for(const Item of List) {
        ModItem.register(Item)
    }
}