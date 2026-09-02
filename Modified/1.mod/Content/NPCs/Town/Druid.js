import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ShopIcon } from './../../UI/ShopIcon.js';
import { ModNPC } from './../../../TL/ModNPC.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';
import { NPCHappiness, AffectionLevel } from './../../../TL/NPCHappiness.js';
import { WorldDB } from './../../../TL/WorldDB.js';

const { Effects } = Modules;
const { Main } = Terraria;
const {
  BestiaryDatabaseNPCsPopulator,
  FlavorTextBestiaryInfoElement
} = Terraria.GameContent.Bestiary;
const { ItemID, NPCID, SoundID, BiomeID, DustID } = Terraria.ID;

const StrikeNPCNoInteraction = 'double StrikeNPCNoInteraction(int Damage, float knockBack, int hitDirection, bool crit, bool noEffect, bool fromNet)';
const FindFirstNPC = Terraria.NPC['int FindFirstNPC(int Type)'];

const FRAME_COUNT = 23;
const ATTACK_RANGE_SQ = 35 * 35;
const ATTACK_DAMAGE = 20;
const ATTACK_COOLDOWN = 30;

let _sourceFrameHeight = 0;

const DRUID_NAMES = [
  'Alyssa', 'Camellia', 'Ceres', 'Cheryl', 'Clover',
  'Erica', 'Fleur', 'Folium', 'Forsythia', 'Hana',
  'Ligna', 'Lignum', 'Lilac', 'Lilly', 'Magnolia',
  'Primrose', 'Rose', 'Viridis', 'Yarrow', 'Zinnia'
];

const CHAT_KEYS = ['Druid_1', 'Druid_2', 'Druid_3', 'Druid_4', 'Druid_5', 'Druid_6'];
const BLOOD_MOON_KEYS = ['Druid_BloodMoon_1', 'Druid_BloodMoon_2'];

export class Druid extends ModNPC {
  constructor() {
    super();
    this.Texture = 'NPCs/Town/Druid/' + this.constructor.name;
    this.attackCooldown = 0;
  }

  SetStaticDefaults() {
    Main.npcFrameCount[this.Type] = FRAME_COUNT;

    NPCID.Sets.ExtraFramesCount[this.Type] = 9;
    NPCID.Sets.AttackFrameCount[this.Type] = 4;
    NPCID.Sets.HatOffsetY[this.Type] = 2;
    NPCID.Sets.ShimmerTownTransform[this.Type] = false;

    NPCID.Sets.NPCBestiaryDrawOffset.Add(
      this.Type,
      NPCID.Sets.NPCBestiaryDrawOffset.get_Item(NPCID.Dryad)
    );

    this.BestiaryRarityStars = 3;

    new NPCHappiness(this.Type)
      .SetBiomeAffection(BiomeID.Jungle, AffectionLevel.Love)
      .SetBiomeAffection(BiomeID.Snow, AffectionLevel.Dislike)
      .SetNPCAffection(NPCID.Dryad, AffectionLevel.Love)
      .SetNPCAffection(NPCID.Princess, AffectionLevel.Like)
      .SetNPCAffection(NPCID.Demolitionist, AffectionLevel.Dislike)
      .SetNPCAffection(NPCID.Steampunker, AffectionLevel.Hate);
  }

  SetDefaults() {
    this.NPC.townNPC = true;
    this.NPC.friendly = true;
    this.NPC.width = 18;
    this.NPC.height = 40;
    this.NPC.aiStyle = 7;
    this.NPC.damage = 20;
    this.NPC.defense = 15;
    this.NPC.lifeMax = 250;
    this.NPC.HitSound = SoundID.NPCHit1;
    this.NPC.DeathSound = SoundID.NPCDeath1;
    this.NPC.knockBackResist = 0.5;
    this.AnimationType = NPCID.Dryad;
  }

  SetBestiary(database, bestiaryEntry) {
    bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Jungle);

    const FlavorText = FlavorTextBestiaryInfoElement.new();
    FlavorText._key = ModLocalization.Translate('Bestiary.Druid');
    bestiaryEntry.Info.Add(FlavorText);
  }

  SetNPCNameList() {
    return DRUID_NAMES;
  }

  FindFrame(npc, frameHeight) {
    if (_sourceFrameHeight === 0) {
      const asset = Terraria.GameContent.TextureAssets.Npc[NPCID.Dryad];
      const count = Main.npcFrameCount[NPCID.Dryad];
      if (!asset?.Value || !count) return;
      _sourceFrameHeight = asset.Value.Height / count;
    }

    let index = Math.round(npc.frame.Y / _sourceFrameHeight);
    if (index < 0) index = 0;
    if (index >= FRAME_COUNT) index = FRAME_COUNT - 1;

    const frame = npc.frame;
    frame.Y = index * frameHeight;
    npc.frame = frame;
  }

  AI(npc) {
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
      return;
    }

    const npcArr = Main.npc;
    for (let i = 0; i < Main.maxNPCs; i++) {
      const enemy = npcArr[i];
      if (!enemy.active || enemy.friendly || enemy.damage <= 0) continue;

      const dx = enemy.Center.X - npc.Center.X;
      const dy = enemy.Center.Y - npc.Center.Y;
      if (dx * dx + dy * dy >= ATTACK_RANGE_SQ) continue;

      enemy[StrikeNPCNoInteraction](ATTACK_DAMAGE, 4, dx > 0 ? 1 : -1, false, false, false);
      this.attackCooldown = ATTACK_COOLDOWN;
      break;
    }
  }

  HitEffect(npc, hitDirection, damage) {
    if (Main.netMode > 0) return;
    const numDust = npc.life > 0 ? 5 : 15;
    for (let k = 0; k < numDust; k++) {
      Effects.NewDustFromNPC(npc, DustID.Grass);
    }
  }

  CanTownNPCSpawn() {
    return WorldDB.get('Thorium:HasBeenDefeated_CorpseBloom') === true;
  }

  GetChat(npc) {
    const player = Main.player[Main.myPlayer];

    const witchDoctor = FindFirstNPC(NPCID.WitchDoctor);
    if (witchDoctor >= 0 && Math.random() < 1 / 6) {
      return this._say('Druid_WitchDoctor', Main.npc[witchDoctor].GivenName);
    }

    const dryad = FindFirstNPC(NPCID.Dryad);
    if (dryad >= 0 && Math.random() < 1 / 7) {
      return this._say('Druid_Dryad', Main.npc[dryad].GivenName);
    }

    if (Main.bloodMoon && Math.random() < 1 / 5) {
      return this._say(BLOOD_MOON_KEYS[Math.floor(Math.random() * BLOOD_MOON_KEYS.length)], player.name);
    }

    return this._say(CHAT_KEYS[Math.floor(Math.random() * CHAT_KEYS.length)], player.name);
  }

  _say(key, name) {
    const message = ModLocalization.Translate(`NPCChat.${key}`);
    return message.includes('{0}') ? message.replace('{0}', name) : message;
  }

  SetChatButtons(npc, player, button1, button2) {
    button1.text = Terraria.Localization.Language.GetText('LegacyInterface.28').Value;
    button1.texture = ShopIcon.Texture();
    button1.cost = 0;
  }

  Option1Clicked(npc, player) {
    this.OpenShop(npc, player);
  }

  SetupShop(npc, player, npcShop) {
    npcShop.Clear();

    const seedPrice = Terraria.Item.buyPrice(0, 0, 10, 0);
    const seeds = [
      [ItemID.DaybloomSeeds, Terraria.NPC.downedSlimeKing],
      [ItemID.BlinkrootSeeds, Terraria.NPC.downedBoss1],
      [ItemID.ShiverthornSeeds, Terraria.NPC.downedBoss3],
      [ItemID.WaterleafSeeds, Terraria.NPC.downedBoss3],
      [ItemID.DeathweedSeeds, Terraria.NPC.downedBoss2],
      [ItemID.MoonglowSeeds, Terraria.NPC.downedQueenBee],
      [ItemID.FireblossomSeeds, Main.hardMode]
    ];

    for (const [type, unlocked] of seeds) {
      if (unlocked) npcShop.Add(type, 1, seedPrice);
    }

    npcShop.Add(ModItem.getTypeByName('LifeDisperser'), 1, Terraria.Item.buyPrice(0, 3, 75, 0));
    npcShop.Add(ModItem.getTypeByName('DruidCloak'), 1, Terraria.Item.buyPrice(0, 1, 0, 0));
  }

  CanGoToStatue(npc, toKingStatue) {
    return toKingStatue;
  }
}
