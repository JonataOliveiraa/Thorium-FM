import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;

export class AncientArcher extends ModNPC {
  constructor() {
    super();
    this.Texture = 'NPCs/MarbleCave/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Main.npcFrameCount[this.Type] = Main.npcFrameCount[Terraria.ID.NPCID.SkeletonArcher];
    Terraria.ID.NPCID.Sets.Skeletons[this.Type] = true;
  }

  SetDefaults() {
    this.NPC.width = 18;
    this.NPC.height = 40;
    this.NPC.damage = 20;
    this.NPC.defense = 10;
    this.NPC.lifeMax = 65;
    this.NPC.HitSound = Terraria.ID.SoundID.NPCHit4;
    this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath2;
    this.NPC.value = ModNPC.NPCValue(0, 0, 3, 0);
    this.NPC.knockBackResist = 0.4;
    this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Fighter;

    this.AIType = 111;
    this.AnimationType = 111;
  }

  PostAI(npc) {
    npc.TargetClosest(true);
  }

  ApplyBuffImmunity(npc) {
    npc.buffImmune[Terraria.ID.BuffID.Poisoned] = true;
  }

  SpawnChance(info) {
    if (!info.CommonEnemy || !info.BelowSurface || info.PlayerSafe || !info.Player.ZoneMarble) return 0;
    if (!Terraria.NPC.downedBoss3) return 0;
    return 0.18;
  }

  SetBestiary(database, bestiaryEntry) {
    bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Marble);
    const flavor = FlavorTextBestiaryInfoElement.new();
    flavor._key = ModLocalization.Translate('Bestiary.AncientArcher');
    bestiaryEntry.Info.Add(flavor);
  }

  HitEffect(npc, hitDirection, damage) {
    if (Main.netMode === 2) return;

    if (npc.life <= 0) {
      FxHelper.burst(npc.position, npc.width, npc.height, 10, 57, 3, 0.9, 0, false);
      return;
    }

    const count = Math.min(10, Math.floor(damage / npc.lifeMax * 50));
    FxHelper.burst(npc.position, npc.width, npc.height, count, 57, 1, 0.9, 0, false);
  }

  ModifyNPCLoot(npcLoot) {
    AncientArcher.AddCommonMarbleLoot(npcLoot);
  }

  static AddCommonMarbleLoot(npcLoot) {
    const bronzeFragments = ModItem.getTypeByName('BronzeAlloyFragments');
    if (bronzeFragments > 0) {
      npcLoot.Add(ItemDropRule.Common(bronzeFragments, 1, 1, 2));
    }

    npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.GladiatorHelmet, 21, 1, 1));
    npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.GladiatorBreastplate, 21, 1, 1));
    npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.GladiatorLeggings, 21, 1, 1));
    npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.Hook, 25, 1, 1));
    npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.Gladius, 50, 1, 1));
    npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.Pizza, 50, 1, 1));
  }
}
