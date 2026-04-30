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
        ThoriumPlayer.LifeRecoveryBuffDelayTime++;
        
        if (ThoriumPlayer.LifeRecoveryBuffDelayTime >= 60) {
            player.Heal(this.HealValue);
            ThoriumPlayer.LifeRecoveryBuffDelayTime = 0 
        }
    }
}