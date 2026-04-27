import { ModBiome } from "../../../TL/ModBiome.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModNPC } from "../../../TL/ModNPC.js";
import { Effects } from "../../../TL/Modules/Effects.js";

const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
export class Hammerhead extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/AquaticDepths/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 4;
    }

    SetDefaults() {
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.SandShark;
        this.NPC.damage = 40;
        this.NPC.defense = 5;
        this.NPC.lifeMax = 220;
        this.NPC.knockBackResist = 1;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 50, 0);
        this.NPC.noGravity = true;
        
        this.AnimationType = Terraria.ID.NPCID.Shark; 
    }

    PostAI(npc) {
        Effects.AddLight(npc.Center, 0, 0.25, 0.35);
    }

    SpawnChance(info) {
        if(ModBiome.getByName('AquaticDepths').IsActive && info.Water) {
            return 0.1
        }
        return 0
    }
}