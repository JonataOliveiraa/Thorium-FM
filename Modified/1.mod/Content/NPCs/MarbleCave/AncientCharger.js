import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { AncientArcher } from './AncientArcher.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Main, Utils } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;

export class AncientCharger extends ModNPC {
  constructor() {
    super();
    this.Texture = 'NPCs/MarbleCave/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Main.npcFrameCount[this.Type] = Main.npcFrameCount[21];
    Terraria.ID.NPCID.Sets.Skeletons[this.Type] = true;
  }

  SetDefaults() {
    this.NPC.width = 24;
    this.NPC.height = 40;
    this.NPC.damage = 35;
    this.NPC.defense = 12;
    this.NPC.lifeMax = 95;
    this.NPC.HitSound = Terraria.ID.SoundID.NPCHit4;
    this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath2;
    this.NPC.value = ModNPC.NPCValue(0, 0, 3, 0);
    this.NPC.knockBackResist = 0.3;
    this.NPC.aiStyle = 26;

    this.AIType = 21;
    this.AnimationType = 21;
  }

  ApplyBuffImmunity(npc) {
    npc.buffImmune[Terraria.ID.BuffID.Poisoned] = true;
  }

  PostAI(npc) {
    npc.TargetClosest(true);
  }

  SpawnChance(info) {
    if (!info.CommonEnemy || !info.BelowSurface || info.PlayerSafe || !info.Player.ZoneMarble) return 0;
    if (!Terraria.NPC.downedBoss3) return 0;
    return 0.18;
  }

  SetBestiary(database, bestiaryEntry) {
    bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Marble);
    const flavor = FlavorTextBestiaryInfoElement.new();
    flavor._key = ModLocalization.Translate('Bestiary.AncientCharger');
    bestiaryEntry.Info.Add(flavor);
  }

  OnHitPlayer(npc, target, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
    if (!Main.expertMode || !Utils.NextBool(Main.rand, 2)) return;
    target.AddBuff(Terraria.ID.BuffID.Bleeding, 600, true, false);
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
