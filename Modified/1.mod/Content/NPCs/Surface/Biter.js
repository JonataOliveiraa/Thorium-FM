import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModLocalization } from "../../../TL/ModLocalization.js";
import { ModNPC } from "../../../TL/ModNPC.js";

const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;

export class Biter extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Surface/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 3;
    }

    SetDefaults() {
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Fighter;
        this.NPC.damage = 15;
        this.NPC.defense = 2;
        this.NPC.lifeMax = 50;
        this.NPC.knockBackResist = 0.5;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 1, 0);

        this.AnimationType = Terraria.ID.NPCID.Zombie;
    }

    SpawnChance(info) {
        if (info.CommonEnemy && info.Surface && !info.PlayerInTown && info.Night && !info.Water) {
            return 0.07;
        }
        return 0;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Surface);
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Times.NightTime);

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.MahoganyEnt');
        bestiaryEntry.Info.Add(FlavorText);
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('Blood'), 4, 1, 2));
    }

    OnHitPlayer(npc, player, target, damage, crit) {
        const buffType = Terraria.ID.BuffID.Bleeding;
        const duration = 60 * 30;
        if (Math.random() < 0.85) player['void AddBuff(int type, int time, bool fromNetPvP)'](buffType, duration, false);
    }
}