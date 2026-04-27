import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModNPC } from "../../../TL/ModNPC.js";

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
        if (info.CommonEnemy && info.Surface && !info.PlayerInTown && info.Night) {
            return 0.15;
        }
        return 0;
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('Blood'), 1, 2, 4));
    }

    OnHitPlayer(npc, player, target, damage, crit) {
        const buffType = Terraria.ID.BuffID.Bleeding;
        const duration = 60 * 30;
        if(Math.random() < 0.85) player['void AddBuff(int type, int time, bool fromNetPvP)'](buffType, duration, false);
    }
}