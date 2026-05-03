import { Terraria } from "../../TL/ModImports.js";
import { ModBuff } from "../../TL/ModBuff.js";
import { ModPlayer } from "../../TL/ModPlayer.js";
import { Vector2 } from "../../TL/Modules/Vector2.js";

export class CharmedBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/" + this.constructor.name;
        this.StunTime = 80;
        this.NewVelocity = Vector2.new(0.90, 0.90)
    }

    UpdatePlayer(player, buffIndex) {
        player.velocity = Vector2.Multiply(player.velocity, this.NewVelocity);
        player.loveStruck = true
    }

    ApplyNPC(npc, buffTime) {
        npc.velocity = Vector2.Multiply(npc.velocity, this.NewVelocity);
        npc.loveStruck = true
    }

    OnRemove(player) {
        player.loveStruck = false
    }
}