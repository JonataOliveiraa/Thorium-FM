import { ModBiome } from "../../../TL/ModBiome.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModNPC } from "../../../TL/ModNPC.js";
import { Effects } from "../../../TL/Modules/Effects.js";

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
        this.NPC.value = ModNPC.NPCValue(0, 0, 5, 0);
        this.NPC.noGravity = true;

        this.AnimationType = Terraria.ID.NPCID.BlueJellyfish; 
    }

    PostAI(npc) {
        Effects.AddLight(npc.Center, 0.9, 0.66, 0);
    }

    SpawnChance(info) {
        if(ModBiome.getByName('AquaticDepths').IsActive && info.Water) {
            return 0.3
        }
        return 0
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.Glowstick, 1, 1, 4));
    }
}