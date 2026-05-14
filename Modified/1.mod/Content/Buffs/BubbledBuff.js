import { ModBuff } from "../../TL/ModBuff.js";

export class BubbledBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/" + this.constructor.name;
    }

    SetStaticDefaults() {
        this.DisplayName = "Bubbled";
        this.Description = "Encased in a water bubble, slowing your movement";
        this.IsDebuff = true;
    }

    UpdatePlayer(player, buffIndex) {
        player.moveSpeed *= 0.5;
    }
}
