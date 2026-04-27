import { GlobalNPC } from "../../../TL/GlobalNPC.js";
import { ModBuff } from "../../../TL/ModBuff.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModPlayer } from "../../../TL/ModPlayer.js";
import { gPlayer } from "../gPlayer.js";

const { NPCID } = Terraria.ID;

export class UpdateNPCBuff extends GlobalNPC {
    constructor() {
        super();
    }

    BlackList = [
        NPCID.EaterofWorldsHead,
        NPCID.EaterofWorldsBody,
        NPCID.EaterofWorldsTail,
        NPCID.GiantWormHead,
        NPCID.GiantWormBody,
        NPCID.GiantWormTail,
        NPCID.TheDestroyer,
        NPCID.TheDestroyerBody,
        NPCID.TheDestroyerTail
    ];

    PreAI(npc) {
        if (npc['int FindBuffIndex(int type)'](ModBuff.getTypeByName("StunnedBuff")) > -1 &&
            !this.BlackList.includes(npc.type) &&
            npc.lifeMax < 200 &&
            !npc.boss) {
            npc.velocity = Vector2.Zero;
        }
    }
}