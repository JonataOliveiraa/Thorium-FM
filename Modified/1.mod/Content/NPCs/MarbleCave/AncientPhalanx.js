import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { AncientArcher } from './AncientArcher.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;

export class AncientPhalanx extends ModNPC {
  constructor() {
    super();
    this.Texture = 'NPCs/MarbleCave/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Main.npcFrameCount[this.Type] = Main.npcFrameCount[482];
    Terraria.ID.NPCID.Sets.Skeletons[this.Type] = true;
  }

  SetDefaults() {
    this.NPC.width = 30;
    this.NPC.height = 40;
    this.NPC.damage = 32;
    this.NPC.defense = 20;
    this.NPC.lifeMax = 125;
    this.NPC.HitSound = Terraria.ID.SoundID.NPCHit4;
    this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath2;
    this.NPC.value = ModNPC.NPCValue(0, 0, 4, 0);
    this.NPC.knockBackResist = 0.2;
    this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Fighter;
    this.NPC.scale = 1;

    this.AIType = 482;
    this.AnimationType = 482;
  }

  ApplyBuffImmunity(npc) {
    npc.buffImmune[Terraria.ID.BuffID.Poisoned] = true;
  }

  PostAI(npc) {
    npc.TargetClosest(true);
  }

  SpawnChance(info) {
    if (!info.CommonEnemy || !info.BelowSurface || info.PlayerSafe || !info.Player.ZoneMarble || info.SpawnTileType !== Terraria.ID.TileID.Marble) return 0;
    if (!Terraria.NPC.downedBoss3) return 0;
    return 0.18;
  }

  SetBestiary(database, bestiaryEntry) {
    bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Marble);
    const flavor = FlavorTextBestiaryInfoElement.new();
    flavor._key = ModLocalization.Translate('Bestiary.AncientPhalanx');
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
}
