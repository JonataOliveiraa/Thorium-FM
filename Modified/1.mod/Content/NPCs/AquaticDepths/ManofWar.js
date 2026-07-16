import { ModBiome } from "../../../TL/ModBiome.js";
import { Microsoft, Modules, Terraria } from "../../../TL/ModImports.js";
import { ModLocalization } from "../../../TL/ModLocalization.js";
import { ModNPC } from "../../../TL/ModNPC.js";
import { Effects } from "../../../TL/Modules/Effects.js";

const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;

export class ManofWar extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/AquaticDepths/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 7;
    }

    SetDefaults() {
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Jellyfish;
        this.NPC.damage = 35;
        this.NPC.defense = 5;
        this.NPC.lifeMax = 95;
        this.NPC.knockBackResist = 0.1;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 2, 11);
        this.NPC.noGravity = true;

        this.AnimationType = Terraria.ID.NPCID.BlueJellyfish;
    }

    PostAI(npc) {
        Effects.AddLight(npc.Center, 0.9, 0.66, 0);
    }

    SpawnChance(info) {
        if (ModBiome.getByName('AquaticDepths').IsActive && Terraria.Main.player[Terraria.Main.myPlayer].wet) {
            return 0.2
        }
        return 0
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Ocean);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.ManofWar');
        bestiaryEntry.Info.Add(FlavorText);
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.Glowstick, 1, 1, 4));
    }
}