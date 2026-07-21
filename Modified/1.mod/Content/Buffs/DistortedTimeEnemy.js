import { Terraria } from "../../TL/ModImports.js";
import { ModBuff } from "../../TL/ModBuff.js";
import { ModPlayer } from "../../TL/ModPlayer.js";
import { Vector2 } from "../../TL/Modules/Vector2.js";

export class DistortedTimeEnemy extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/" + this.constructor.name;
        this.NewVelocity = Vector2.new(0.60, 0.60)
    }

    UpdatePlayer(player, buffIndex) {
        player.velocity = Vector2.Multiply(player.velocity, this.NewVelocity);
    }

    ApplyNPC(npc, buffTime) {
        npc.velocity = Vector2.Multiply(npc.velocity, this.NewVelocity);
    }
}