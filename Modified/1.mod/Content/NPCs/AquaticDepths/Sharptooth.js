import { ModBiome } from "../../../TL/ModBiome.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModNPC } from "../../../TL/ModNPC.js";
import { Effects } from "../../../TL/Modules/Effects.js";

const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
export class Sharptooth extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/AquaticDepths/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 6;
    }

    SetDefaults() {
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Piranha;
        this.NPC.damage = 30;
        this.NPC.defense = 5;
        this.NPC.lifeMax = 40;
        this.NPC.knockBackResist = 0.1;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 3, 0);
        this.NPC.noGravity = true;
        
        this.AnimationType = Terraria.ID.NPCID.Piranha; 
    }

    PostAI(npc) {
        Effects.AddLight(npc.Center, 0, 0.5, 0.7);
    }

    SpawnChance(info) {
        if(ModBiome.getByName('AquaticDepths').IsActive && info.Water) {
            return 0.3
        }
        return 0
    }
}