import { ModBiome } from "../../../TL/ModBiome.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
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
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Piranha;
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
        if (ModBiome.getByName('AquaticDepths').IsActive && Terraria.Main.player[Terraria.Main.myPlayer].wet) {
            return 0.15
        }
        return 0
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('DepthScales'), 1, 1, 2));
        npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.SharkFin, 1, 1, 1));
    }
}