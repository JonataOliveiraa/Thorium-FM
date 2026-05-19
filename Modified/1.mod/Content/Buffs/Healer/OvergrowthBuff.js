import { Terraria } from "../../../TL/ModImports.js";
import { ModBuff } from "../../../TL/ModBuff.js";
import { ThoriumPlayer } from "../../Global/ThoriumPlayer.js";

export class OvergrowthBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/Healer/" + this.constructor.name;
        this.HealValue = 1
    }

    UpdatePlayer(player, buffIndex) {
        ThoriumPlayer.LifeRecoveryExtraValue += 3
        ThoriumPlayer.LifeRecoveryDelayMaxTime -= 10
    }
}