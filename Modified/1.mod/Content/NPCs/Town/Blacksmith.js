import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModNPC } from './../../../TL/ModNPC.js';
import { ModGore } from './../../../TL/ModGore.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';
import { NPCHappiness, AffectionLevel } from './../../../TL/NPCHappiness.js';

const { Color, Effects, Vector2 } = Modules;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const {
  BestiaryDatabaseNPCsPopulator,
  FlavorTextBestiaryInfoElement
} = Terraria.GameContent.Bestiary;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class Blacksmith extends ModNPC {
  constructor() {
    super();
    this.Texture = "NPCs/Town/Blacksmith/" + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.npcFrameCount[this.Type] = 25;

    Terraria.ID.NPCID.Sets.DangerDetectRange[this.Type] = 120;
    Terraria.ID.NPCID.Sets.ExtraFramesCount[this.Type] = 9;
    Terraria.ID.NPCID.Sets.AttackFrameCount[this.Type] = 4;
    Terraria.ID.NPCID.Sets.AttackType[this.Type] = 1;
    Terraria.ID.NPCID.Sets.AttackTime[this.Type] = 20;
    Terraria.ID.NPCID.Sets.AttackAverageChance[this.Type] = 10;
    Terraria.ID.NPCID.Sets.HatOffsetY[this.Type] = 2;
    Terraria.ID.NPCID.Sets.ShimmerTownTransform[this.Type] = false;

    Terraria.ID.NPCID.Sets.NPCBestiaryDrawOffset.Add(
      this.Type,
      Terraria.ID.NPCID.Sets.NPCBestiaryDrawOffset.get_Item(Terraria.ID.NPCID.Guide)
    );

    this.BestiaryRarityStars = 3;

    new NPCHappiness(this.Type)
      .SetNPCAffection(Terraria.ID.NPCID.Demolitionist, AffectionLevel.Love)
      .SetNPCAffection(Terraria.ID.NPCID.GoblinTinkerer, AffectionLevel.Like)
      .SetBiomeAffection(Terraria.ID.BiomeID.NormalUnderground, AffectionLevel.Like);
  }

  SetDefaults() {
    this.NPC.townNPC = true;
    this.NPC.friendly = true;
    this.NPC.width = 18;
    this.NPC.height = 40;
    this.NPC.aiStyle = 7;
    this.NPC.damage = 10;
    this.NPC.defense = 15;
    this.NPC.lifeMax = 250;
    this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
    this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
    this.NPC.knockBackResist = 0.5;
    this.AnimationType = 22;
  }

  SetBestiary(database, bestiaryEntry) {
    bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Surface);

    const FlavorText = FlavorTextBestiaryInfoElement.new();
    FlavorText._key = ModLocalization.Translate("Bestiary.Blacksmith");
    bestiaryEntry.Info.Add(FlavorText);
  }

  SetNPCNameList() {
    const names = [
      "Albert",
      "Clay",
      "Kendall",
      "Ornn"
    ];
    return names;
  }

  HitEffect(npc, hitDirection, damage) {
    if (Terraria.Main.netMode > 0) {
      return;
    }

    let numDust = npc.life > 0 ? 5 : 15;
    for (let k = 0; k < numDust; k++) {
      Effects.NewDustFromNPC(npc, Terraria.ID.DustID.Blood);
    }

    if (npc.life > 0) return;

    let variant = '';
    if (npc.IsShimmerVariant)
      variant += '_Shimmer';
    if (npc.altTexture == 1)
      variant += '_Party';

    let headGore = ModGore.getTypeByName(`${this.constructor.name}_Gore${variant}_Head`);
    let armGore = ModGore.getTypeByName(`${this.constructor.name}_Gore${variant}_Arm`);
    let legGore = ModGore.getTypeByName(`${this.constructor.name}_Gore${variant}_Leg`);

    Effects.NewGoreFromNPC(npc, headGore);
    Effects.NewGoreFromNPC(npc, armGore, true);
    Effects.NewGoreFromNPC(npc, armGore, true);
    Effects.NewGoreFromNPC(npc, legGore, true);
    Effects.NewGoreFromNPC(npc, legGore, true);
  }

  CanTownNPCSpawn() {
    return Terraria.NPC.downedBoss1;
  }

  GetChat(npc) {
    const keys = [
      'Blacksmith_1',
      'Blacksmith_2',
      'Blacksmith_3',
      'Blacksmith_4'
    ];

    const key = keys[Math.floor(Math.random() * keys.length)];
    return ModLocalization.Translate(`NPCChat.${key}`);
  }

  SetChatButtons(npc, player, button1, button2) {
    button1.text = Terraria.Localization.Language.GetText('LegacyInterface.28').Value;
    button1.texture = Terraria.GameContent.TextureAssets.NpcHead[this.NPCHeadSlot()].Value;
    button1.cost = 0;
  }

  Option1Clicked(npc, player) {
    this.OpenShop(npc, player);
  }

  SetupShop(npc, player, npcShop) {
    npcShop.Clear();

    if (!Terraria.Main.hardMode) {
      npcShop.AddRange([
        ModItem.getTypeByName("SteelHelmet"),
        ModItem.getTypeByName("SteelChestplate"),
        ModItem.getTypeByName("SteelGreaves"),
        ModItem.getTypeByName("SteelBlade"),
        ModItem.getTypeByName("SteelAxe"),
        ModItem.getTypeByName("SteelPickaxe"),
        ModItem.getTypeByName("SteelHammer"),
        ModItem.getTypeByName("SteelBow"),
        Terraria.ID.ItemID.DyeVat,
      ])
    }
  }

  ModifyNPCHappiness(npc, player, PrimaryPlayerBiome, shopHelper, nearbyNPCsByType) {
    if (!Terraria.Main.dayTime) {
      shopHelper._currentPriceAdjustment = 1000;
      shopHelper._currentHappiness = ModLocalization.Translate('TownNPCMood.Blacksmith.SpecialMoodText');
    }
  }

  CanGoToStatue(npc, toKingStatue) {
    return toKingStatue;
  }
}