import { ModBiome } from '../../../TL/ModBiome.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Rand } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;

const BLEED_CHANCE = 8;   // 1 em N de aplicar sangramento
const BLEED_TIME = 1800;

export class Barracuda extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/AquaticDepths/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 6;
    }

    SetDefaults() {
        this.NPC.width = 50;
        this.NPC.height = 30;
        // AI de piranha: persegue mesmo atraves de parede quando o alvo esta na agua
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Piranha;
        this.NPC.damage = 25;
        this.NPC.defense = 5;
        this.NPC.lifeMax = 100;
        this.NPC.knockBackResist = 0.65;
        this.NPC.noGravity = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 1, 0);

        this.AIType = Terraria.ID.NPCID.Piranha;
        this.AnimationType = Terraria.ID.NPCID.Piranha;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
    }

    SpawnChance(info) {
        if (ModBiome.getByName('AquaticDepths').IsActive) return 0.25;
        return 0;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Ocean);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.Barracuda');
        bestiaryEntry.Info.Add(FlavorText);
    }

    OnHitPlayer(npc, player) {
        if (Rand.Next(BLEED_CHANCE) !== 0) return;
        player.AddBuff(Terraria.ID.BuffID.Bleeding, BLEED_TIME, false);
    }

    HitEffect(npc, hitDirection, damage) {
        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 10, 5, 2.5, 1, 0, false);
            return;
        }

        const count = Math.min(6, Math.floor(damage / npc.lifeMax * 50));
        FxHelper.burst(npc.position, npc.width, npc.height, count, 5, 1, 1, 0, false);
    }

    // TODO: GoldenScale (1/200) quando o item existir
    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('DepthScales'), 1, 1, 2));
    }
}
