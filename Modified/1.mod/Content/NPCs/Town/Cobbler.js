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

const COBBLER_NAMES = [
  'Alfred', 'Alphonse', 'Barney', 'Baxter', 'Calvin', 'Curtis',
  'Desmond', 'Dimitri', 'Fred', 'Griswald', 'Ike', 'Jonathan',
  'Kenneth', 'Larry', 'Lawrence', 'Louis', 'Quinn', 'Stanley'
];

export class Cobbler extends ModNPC {
  constructor() {
    super();
    this.Texture = "NPCs/Town/Cobbler/" + this.constructor.name;
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
      .SetNPCAffection(NPCID.BestiaryGirl, AffectionLevel.Love)
      .SetBiomeAffection(Terraria.ID.BiomeID.Forest, AffectionLevel.Like)
      .SetNPCAffection(NPCID.Clothier, AffectionLevel.Dislike)
      .SetNPCAffection(Terraria.ID.BiomeID.Snow, AffectionLevel.Dislike)
      .SetNPCAffection(NPCID.Nurse, AffectionLevel.Dislike);
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
    bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Surface);

    const FlavorText = FlavorTextBestiaryInfoElement.new();
    FlavorText._key = ModLocalization.Translate("Bestiary.Cobbler");
    bestiaryEntry.Info.Add(FlavorText);
  }

  SetNPCNameList() {
    return COBBLER_NAMES;
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
      Effects.NewDustFromNPC(npc, Terraria.ID.DustID.Blood);
    }
  }

  CanTownNPCSpawn() {
    return WorldDB.get('Thorium:CanSpawnTownNPC_Cobbler') == true
  }

  GetChat(npc) {
    const player = Terraria.Main.player[Terraria.Main.myPlayer];
    const keys = [
      'Cobbler_1',
      'Cobbler_2',
      'Cobbler_3',
      'Cobbler_4',
      'Cobbler_5'
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
      ModItem.getTypeByName('TravelersBoots'),
      ModItem.getTypeByName('HealthyBoots'),
      ModItem.getTypeByName('WizardShoes'),
      ModItem.getTypeByName('DriftBoots'),
      ModItem.getTypeByName('TurboBoots'),
      ModItem.getTypeByName('MarchingBoots'),
      ModItem.getTypeByName('SteelToedBoots'),
      ModItem.getTypeByName('HoverBoots'),
    ]);
  }

  ModifyNPCHappiness(npc, player, PrimaryPlayerBiome, shopHelper, nearbyNPCsByType) {

  }

  CanGoToStatue(npc, toKingStatue) {
    return toKingStatue;
  }
}