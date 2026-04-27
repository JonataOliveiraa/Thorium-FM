import { Terraria } from "../../TL/ModImports.js";
import { ModBuff } from "../../TL/ModBuff.js";
import { ModPlayer } from "../../TL/ModPlayer.js";
import { Vector2 } from "../../TL/Modules/Vector2.js";

export class StunnedBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/" + this.constructor.name;
        this.StunTime = 80;
        this.NPCAI = null;
    }

    UpdatePlayer(player, buffIndex) {
        player.velocity = Vector2.Zero;
    }

    ApplyNPC(npc, buffTime) {
        npc.velocity = Vector2.Zero;
    }
}