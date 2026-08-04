import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Color, Effects } = Modules;
const { Main } = Terraria;
const WHITE = Color.White;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;

const TRAIL_RATE = 2; // 1 rastro a cada N ticks

export class SpaceSlime extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Meteor/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = Main.npcFrameCount[Terraria.ID.NPCID.BlueSlime];
    }

    SetDefaults() {
        this.NPC.width = 30;
        this.NPC.height = 24;
        this.NPC.scale = 1.1;
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Slime;
        this.NPC.damage = 18;
        this.NPC.defense = 6;
        this.NPC.lifeMax = 50;
        this.NPC.knockBackResist = 0.6;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit3;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 0, 75);

        this.AIType = Terraria.ID.NPCID.BlueSlime;
        this.AnimationType = Terraria.ID.NPCID.BlueSlime;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Poisoned] = true;
        npc.buffImmune[Terraria.ID.BuffID.OnFire] = true;
    }

    SpawnChance(info) {
        if (!info.Meteor || info.AnyEvent) return 0;
        return Main.hardMode ? 0.1 : 0.5;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Meteor);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.SpaceSlime');
        bestiaryEntry.Info.Add(FlavorText);
    }

    // A gosma vai soltando brasa enquanto pula
    PostAI(npc) {
        if (Main.GameUpdateCount % TRAIL_RATE !== 0) return;

        const vel = npc.velocity;

        const ember = Main.dust[Effects.NewDust(npc.position, npc.width, npc.height, 6, vel.X, vel.Y, 140, WHITE, 1.3)];
        if (ember) ember.noGravity = true;

        const spark = Main.dust[Effects.NewDust(npc.position, npc.width, npc.height, 55, vel.X, vel.Y, 140, WHITE, 0.5)];
        if (spark) spark.noGravity = true;
    }

    HitEffect(npc, hitDirection, damage) {
        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 10, 6, 2.5, 1.3, 0, false);
            FxHelper.burst(npc.position, npc.width, npc.height, 10, 25, 2.5, 1.4, 0, false);
            return;
        }

        const count = Math.min(6, Math.floor(damage / npc.lifeMax * 50));
        FxHelper.burst(npc.position, npc.width, npc.height, count, 6, 1, 0.9, 0, false);
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.Meteorite, 5, 1, 1));
    }
}
