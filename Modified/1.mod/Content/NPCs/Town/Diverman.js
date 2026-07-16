import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModNPC } from './../../../TL/ModNPC.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';
import { NPCHappiness, AffectionLevel } from './../../../TL/NPCHappiness.js';
import { WorldDB } from '../../../TL/WorldDB.js';

const { Color, Effects, Vector2 } = Modules;
const { Main } = Terraria;
const {
  BestiaryDatabaseNPCsPopulator,
  FlavorTextBestiaryInfoElement
} = Terraria.GameContent.Bestiary;
const { ItemID, NPCID, SoundID } = Terraria.ID;

const StrikeNPCNoInteraction = 'double StrikeNPCNoInteraction(int Damage, float knockBack, int hitDirection, bool crit, bool noEffect, bool fromNet)';

const DIVERMAN_NAMES = [
    "Adin",
    "Alexandre",
    "Austin",
    "Calder",
    "Cameron",
    "Carlos",
    "Clyde",
    "Elias",
    "Ethan",
    "Francisco",
    "Jesse",
    "Maxwell",
    "Neil",
    "Nolen",
    "Percy",
    "Roberto",
    "Rodrigues",
    "Sam",
    "Cainam"
];

export class Diverman extends ModNPC {
  constructor() {
    super();
    this.Texture = "NPCs/Town/Diverman/" + this.constructor.name;
    this.attackCooldown = 0;
  }

  SetStaticDefaults() {
    Main.npcFrameCount[this.Type] = 25;

    NPCID.Sets.ExtraFramesCount[this.Type] = 9;
    NPCID.Sets.AttackFrameCount[this.Type] = 2;
    NPCID.Sets.HatOffsetY[this.Type] = 2;
    NPCID.Sets.ShimmerTownTransform[this.Type] = false;

    NPCID.Sets.NPCBestiaryDrawOffset.Add(
      this.Type,
      NPCID.Sets.NPCBestiaryDrawOffset.get_Item(NPCID.Guide)
    );

    this.BestiaryRarityStars = 3;

    new NPCHappiness(this.Type)
      .SetNPCAffection(NPCID.PartyGirl, AffectionLevel.Love)
      .SetBiomeAffection(Terraria.ID.BiomeID.Ocean, AffectionLevel.Like)
      .SetNPCAffection(NPCID.Pirate, AffectionLevel.Like)
      .SetNPCAffection(Terraria.ID.BiomeID.Desert, AffectionLevel.Dislike)
      .SetNPCAffection(NPCID.Princess, AffectionLevel.Like)
      .SetNPCAffection(NPCID.Angler, AffectionLevel.Dislike);
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
    this.AnimationType = NPCID.Guide;
  }

  SetBestiary(database, bestiaryEntry) {
    bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Ocean);

    const FlavorText = FlavorTextBestiaryInfoElement.new();
    FlavorText._key = ModLocalization.Translate("Bestiary.Diverman");
    bestiaryEntry.Info.Add(FlavorText);
  }

  SetNPCNameList() {
    return DIVERMAN_NAMES;
  }

  AI(npc) {
    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.attackCooldown > 0) return;

    const npcArr = Main.npc;
    for (let i = 0; i < 200; i++) {
      const enemy = npcArr[i];
      if (!enemy.active || enemy.friendly || enemy.damage <= 0) continue;

      const dx = enemy.Center.X - npc.Center.X;
      const dy = enemy.Center.Y - npc.Center.Y;
      const distSq = dx * dx + dy * dy;

      if (distSq < 35 * 35) {
        const dir = dx > 0 ? 1 : -1;
        enemy[StrikeNPCNoInteraction](20, 4, dir, false, false, false);
        this.attackCooldown = 30;
        break;
      }
    }
  }

  HitEffect(npc, hitDirection, damage) {
    if (Main.netMode > 0) return;
    const numDust = npc.life > 0 ? 5 : 15;
    for (let k = 0; k < numDust; k++) {
      Effects.NewDustFromNPC(npc, Terraria.ID.DustID.Copper);
    }
  }

  CanTownNPCSpawn() {
    return WorldDB.get('QueenJellyfish:Downed') === true
  }

  GetChat(npc) {
    const player = Terraria.Main.player[Terraria.Main.myPlayer];
    const keys = [
      'Diverman_1',
      'Diverman_2',
      'Diverman_3',
      'Diverman_4',
      'Diverman_5',
      'Diverman_6',
      'Diverman_7',
      'Diverman_8',
      'Diverman_9',
      'Diverman_10',
      'Diverman_11',
      'Diverman_12',
    ];
    
    let key = keys[Math.floor(Math.random() * keys.length)];
    let message = ModLocalization.Translate(`NPCChat.${key}`);
    if(message.includes('{0}')) message = message.replace('{0}', player.name)
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

    npcShop.AddRange([
      ItemID.Coral,
      319,
      ModItem.getTypeByName('MarineCatcher'),
      ModItem.getTypeByName('DiverHelmet'),
      ModItem.getTypeByName('DiverSuit'),
      ModItem.getTypeByName('DiverLeggings'),
    ]);
  }

  CanGoToStatue(npc, toKingStatue) {
    return toKingStatue;
  }
}