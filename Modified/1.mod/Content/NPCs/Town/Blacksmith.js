import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModNPC } from './../../../TL/ModNPC.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';
import { NPCHappiness, AffectionLevel } from './../../../TL/NPCHappiness.js';

const { Effects } = Modules;
const {
  BestiaryDatabaseNPCsPopulator,
  FlavorTextBestiaryInfoElement
} = Terraria.GameContent.Bestiary;

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
    FlavorText._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
    bestiaryEntry.Info.Add(FlavorText);
  }

  SetNPCNameList() {
    return [
      "Albert",
      "Clay",
      "Kendall",
      "Ornn"
    ];
  }

  HitEffect(npc, hitDirection, damage) {
    const numDust = npc.life > 0 ? 5 : 15;
    for (let k = 0; k < numDust; k++) {
      Effects.NewDustFromNPC(npc, Terraria.ID.DustID.Blood);
    }
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

    // NPCHeadSlot() retorna -1 se o _Head nao existir, e NpcHead[-1] quebra
    const headSlot = this.NPCHeadSlot();
    button1.texture = headSlot >= 0
      ? Terraria.GameContent.TextureAssets.NpcHead[headSlot].Value
      : null;

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
        Terraria.ID.ItemID.DyeVat
      ]);
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