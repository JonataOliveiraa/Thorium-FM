import { Terraria } from "../../../TL/ModImports.js";
import { ModBuff } from "../../../TL/ModBuff.js";
import { ModPlayer } from "../../../TL/ModPlayer.js";
import { ThoriumPlayer } from "../../Global/ThoriumPlayer.js";

export class LifeRecoveryBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/Healer/" + this.constructor.name;
        this.HealValue = 1
    }

    UpdatePlayer(player, buffIndex) {
        ThoriumPlayer.LifeRecoveryBuffActive = true;
    }
}