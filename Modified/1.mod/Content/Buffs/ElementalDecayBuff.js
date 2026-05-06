import { Terraria } from "../../TL/ModImports.js";
import { ModBuff } from "../../TL/ModBuff.js";
import { ModPlayer } from "../../TL/ModPlayer.js";
import { Vector2 } from "../../TL/Modules/Vector2.js";

export class ElementalDecayBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/" + this.constructor.name;
    }

    static Damage = 12

    UpdatePlayer(player, buffIndex) {
    }

    ApplyNPC(npc, buffTime) {
    }
}